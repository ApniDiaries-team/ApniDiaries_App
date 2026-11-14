import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import InCallManager from "react-native-incall-manager";
import Toast from "react-native-toast-message";
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";
import { AppContext } from "../context/AppContext";
import { socket } from "../lib/sockets";
import { useCall as useCallContext } from "../pages/call-interface/context/CallContext";

// TODO: replace the shared openrelay TURN with YOUR OWN TURN credentials
// (Metered / Twilio / Xirsys / coturn). Put them in .env as EXPO_PUBLIC_TURN_*.
const TURN_URL = process.env.EXPO_PUBLIC_TURN_URL;
const TURN_USER = process.env.EXPO_PUBLIC_TURN_USERNAME;
const TURN_PASS = process.env.EXPO_PUBLIC_TURN_CREDENTIAL;

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    ...(TURN_URL
      ? [
          { urls: TURN_URL, username: TURN_USER, credential: TURN_PASS },
        ]
      : [
          // Fallback: shared public TURN (unreliable, for testing only)
          { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
          { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
          { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
        ]),
  ],
  iceCandidatePoolSize: 10,
};

export default function useCall() {
  const pc = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const candidatesQueue = useRef([]);
  const isFrontCamera = useRef(true);
  const inCallManagerStarted = useRef(false);
  const connectTimer = useRef(null);
  const mediaSetupPromise = useRef(null);
  const pcSetupPromise = useRef(null);

  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [localStreamURL, setLocalStreamURL] = useState("");
  const [remoteStreamURL, setRemoteStreamURL] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const { call, callStatus, endCall: contextEndCall } = useCallContext();
  const { user } = useContext(AppContext);
  const currentUserId = user?.id;

  const otherUserId = useCallback(() => {
    if (!call) return null;
    return String(call.callerId) === String(currentUserId)
      ? call.receiverId
      : call.callerId;
  }, [call, currentUserId]);

  const cleanup = useCallback(() => {
    clearTimeout(connectTimer.current);
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
      localStream.current = null;
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    remoteStream.current = null;
    candidatesQueue.current = [];
    isFrontCamera.current = true;
    setHasLocalStream(false);
    setHasRemoteStream(false);
    setLocalStreamURL("");
    setRemoteStreamURL("");
    setIsConnected(false);

    if (inCallManagerStarted.current) {
      try {
        InCallManager.stop();
      } catch (e) {
        console.warn("[InCallManager] stop error:", e.message);
      }
      inCallManagerStarted.current = false;
    }
  }, []);

  // Ends the call with a visible message instead of failing silently
  const failCall = useCallback(
    (msg) => {
      console.warn("[Call] failCall:", msg);
      Toast.show({ type: "error", text1: msg });
      cleanup();
      contextEndCall();
    },
    [cleanup, contextEndCall],
  );

  useEffect(() => {
    const inactiveStatuses = ["ended", "rejected", "busy", "offline", "missed", null];
    if (inactiveStatuses.includes(callStatus)) {
      if (localStream.current || pc.current) cleanup();
    }
  }, [callStatus, cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Start the audio session when the call becomes active
  useEffect(() => {
    if (callStatus === "active" && !inCallManagerStarted.current) {
      inCallManagerStarted.current = true;
      const isVideo = call?.callType === "video";
      try {
        InCallManager.start({ media: isVideo ? "video" : "audio" });
        // video calls -> speaker, audio calls -> earpiece (user can toggle)
        InCallManager.setForceSpeakerphoneOn(isVideo);
        console.log("[InCallManager] started:", isVideo ? "video" : "audio");
      } catch (e) {
        console.warn("[InCallManager] start error:", e.message);
      }
    }
  }, [callStatus, call?.callType]);

  const createPeerConnection = useCallback(async () => {
    if (pc.current) return pc.current;
    if (pcSetupPromise.current) {
      console.log("[WebRTC] Waiting for in-progress createPeerConnection...");
      return pcSetupPromise.current;
    }
    pcSetupPromise.current = (async () => {
      pc.current = new RTCPeerConnection(configuration);

      // If media does not connect within 25s, end the call with a message
      clearTimeout(connectTimer.current);
      connectTimer.current = setTimeout(() => {
        const s = pc.current?.iceConnectionState;
        if (pc.current && s !== "connected" && s !== "completed") {
          console.warn("[WebRTC] connect timeout, state:", s);
          failCall("Couldn't connect the call");
        }
      }, 25000);

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          const c = event.candidate.candidate || "";
          console.log(
            "[WebRTC] local candidate:",
            c.includes("typ relay") ? "RELAY" : c.includes("typ srflx") ? "srflx" : "host",
          );
          if (otherUserId()) {
            socket.emit("call:signal", {
              callId: call?.id,
              payload: { candidate: event.candidate },
            });
          }
        }
      };

      pc.current.oniceconnectionstatechange = () => {
        const state = pc.current?.iceConnectionState;
        console.log("[WebRTC] ICE state:", state);
        if (state === "connected" || state === "completed") {
          clearTimeout(connectTimer.current);
          setIsConnected(true);
        }
        if (state === "failed") {
          failCall("Call failed to connect");
        }
      };

      pc.current.onconnectionstatechange = () => {
        const state = pc.current?.connectionState;
        console.log("[WebRTC] Connection state:", state);
        if (state === "failed") {
          failCall("Call connection failed");
        }
      };

      pc.current.ontrack = (event) => {
        const stream = event.streams?.[0];
        if (!stream) return;
        console.log("[WebRTC] ontrack, tracks:", stream.getTracks().length);
        remoteStream.current = stream;
        setRemoteStreamURL(stream.toURL());
        setHasRemoteStream(true);
      };

      // Fallback: react-native-webrtc sometimes only fires onaddstream
      pc.current.onaddstream = (event) => {
        const stream = event.stream;
        if (!stream) return;
        console.log("[WebRTC] onaddstream, tracks:", stream.getTracks().length);
        remoteStream.current = stream;
        setRemoteStreamURL(stream.toURL());
        setHasRemoteStream(true);
      };

      return pc.current;
    })();
    try {
      return await pcSetupPromise.current;
    } finally {
      pcSetupPromise.current = null;
    }
  }, [call?.id, otherUserId, failCall]);

  const setupMedia = useCallback(async () => {
    if (localStream.current) return localStream.current;
    if (mediaSetupPromise.current) {
      console.log("[Media] Waiting for in-progress getUserMedia...");
      return mediaSetupPromise.current;
    }
    mediaSetupPromise.current = (async () => {
      const isVideo = call?.callType === "video";

      if (Platform.OS === "android") {
        const perms = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
        if (isVideo) perms.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        const granted = await PermissionsAndroid.requestMultiple(perms);
        console.log("[Media] Permission result:", granted);
        if (perms.some((p) => granted[p] !== PermissionsAndroid.RESULTS.GRANTED)) {
          throw new Error("PERMISSION_DENIED");
        }
      }

      const constraints = {
        audio: true,
        video: isVideo
          ? {
              facingMode: isFrontCamera.current ? "user" : "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: 30,
            }
          : false,
      };

      let stream;
      try {
        stream = await mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("[Media] Retrying with basic constraints:", err.message);
        // If this also fails, the error is thrown to the caller
        stream = await mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });
      }

      localStream.current = stream;
      setLocalStreamURL(stream.toURL());
      setHasLocalStream(true);
      return stream;
    })();

    try {
      return await mediaSetupPromise.current;
    } finally {
      mediaSetupPromise.current = null;
    }
  }, [call?.callType]);

  const addTracksToPeer = useCallback(async () => {
    const stream = await setupMedia();
    const peer = await createPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => {
        const alreadyAdded = peer
          .getSenders()
          .some((s) => s.track?.id === track.id);
        if (!alreadyAdded) peer.addTrack(track, stream);
      });
    }

    return peer;
  }, [setupMedia, createPeerConnection]);

  const processQueuedCandidates = useCallback(async () => {
    if (!pc.current) return;
    for (const candidate of candidatesQueue.current) {
      try {
        await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    }
    candidatesQueue.current = [];
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleSignal = async ({ payload }) => {
      if (!payload) return;

      if (payload.offer) {
        console.log("[WebRTC] Received offer, creating answer...");
        let peer;
        try {
          // ALWAYS add tracks before answering, or the answer has no media lines
          peer = await addTracksToPeer();
        } catch (e) {
          failCall("Microphone/camera not available");
          return;
        }
        if (!peer) return;
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          console.log(
            "[WebRTC] Answer sent. audio:", answer.sdp?.includes("m=audio"),
            "video:", answer.sdp?.includes("m=video"),
          );
          socket.emit("call:signal", { callId: call?.id, payload: { answer } });
          await processQueuedCandidates();
        } catch (err) {
          console.error("[WebRTC] Error handling offer:", err);
        }
      } else if (payload.answer) {
        const peer = pc.current;
        if (!peer) return;
        if (peer.signalingState === "stable") {
          console.warn("[WebRTC] Ignored redundant answer");
          return;
        }
        try {
          console.log("[WebRTC] Received answer, setting remote description...");
          await peer.setRemoteDescription(new RTCSessionDescription(payload.answer));
          await processQueuedCandidates();
        } catch (err) {
          console.error("[WebRTC] Error handling answer:", err);
        }
      } else if (payload.candidate) {
        const peer = pc.current;
        if (peer?.remoteDescription) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (err) {
            // ignore benign candidate errors
          }
        } else {
          candidatesQueue.current.push(payload.candidate);
        }
      }
    };

    socket.on("call:signal", handleSignal);
    return () => socket.off("call:signal", handleSignal);
  }, [call?.id, processQueuedCandidates, addTracksToPeer, failCall]);

  const startCall = useCallback(async () => {
    const targetId = otherUserId();
    console.log("[startCall] fired. targetId:", targetId, "callId:", call?.id);
    if (!targetId) {
      console.warn("[startCall] no targetId, aborting.");
      return;
    }
    try {
      await addTracksToPeer();
    } catch (e) {
      failCall("Microphone/camera not available");
      return;
    }
    const peer = pc.current;
    if (!peer) {
      console.warn("[startCall] no PC after addTracksToPeer, aborting.");
      return;
    }
    try {
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: call?.callType === "video",
      });
      await peer.setLocalDescription(offer);
      console.log(
        "[startCall] offer sent. callId:", call?.id,
        "audio:", offer.sdp?.includes("m=audio"),
        "video:", offer.sdp?.includes("m=video"),
      );
      socket.emit("call:signal", { callId: call?.id, payload: { offer } });
    } catch (err) {
      console.error("[startCall] error:", err);
    }
  }, [addTracksToPeer, otherUserId, call?.id, call?.callType, failCall]);

  const acceptIncoming = useCallback(async () => {
    // Pre-warm media only. The PC is created when the offer arrives.
    console.log("[WebRTC] acceptIncoming: pre-warming media stream...");
    try {
      await setupMedia();
      console.log("[WebRTC] acceptIncoming: media ready, waiting for offer.");
    } catch (e) {
      failCall("Microphone/camera not available");
    }
  }, [setupMedia, failCall]);

  const toggleAudio = useCallback(() => {
    localStream.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
  }, []);

  const toggleVideo = useCallback(() => {
    localStream.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
  }, []);

  const toggleSpeaker = useCallback((isSpeaker) => {
    if (inCallManagerStarted.current) {
      InCallManager.setForceSpeakerphoneOn(isSpeaker);
    }
  }, []);

  const switchCamera = useCallback(() => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack._switchCamera();
      isFrontCamera.current = !isFrontCamera.current;
    }
  }, []);

  const endCall = useCallback(() => {
    cleanup();
    contextEndCall();
  }, [cleanup, contextEndCall]);

  return {
    startCall,
    acceptIncoming,
    setupMedia,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    localStream: localStream.current,
    remoteStream: remoteStream.current,
    localStreamURL,
    remoteStreamURL,
    hasLocalStream,
    hasRemoteStream,
    isConnected,
  };
}