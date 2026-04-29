import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import InCallManager from "react-native-incall-manager";
import {
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from "react-native-webrtc";
import { AppContext } from "../context/AppContext";
import { socket } from "../lib/sockets";
import { useCall as useCallContext } from "../pages/call-interface/context/CallContext";

const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      // Free TURN server — necessary for calls through mobile NAT/firewall
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
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
  // Mutex refs — prevent concurrent getUserMedia / RTCPeerConnection creation
  const mediaSetupPromise = useRef(null);
  const pcSetupPromise = useRef(null);

  const [hasLocalStream, setHasLocalStream] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  // ✅ FIX 2+3: Track stream URLs in state, NOT by reading ref.current at render time.
  // Refs don't trigger re-renders. When ontrack fires, remoteStream.current is set
  // but CallContainer's render still reads the old null value from the stale closure.
  // Storing the URL string in state guarantees the component re-renders with the real URL.
  const [localStreamURL, setLocalStreamURL] = useState("");
  const [remoteStreamURL, setRemoteStreamURL] = useState("");

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
    // ✅ Clear URLs on cleanup
    setLocalStreamURL("");
    setRemoteStreamURL("");

    if (inCallManagerStarted.current) {
      try {
        InCallManager.stop();
      } catch (e) {
        console.warn("[InCallManager] stop error:", e.message);
      }
      inCallManagerStarted.current = false;
    }
  }, []);

  useEffect(() => {
    const inactiveStatuses = ["ended", "rejected", "busy", "offline", "missed", null];
    if (inactiveStatuses.includes(callStatus)) {
      if (localStream.current) cleanup();
    }
  }, [callStatus, cleanup]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // ✅ FIX 2b (audio timing): Start InCallManager when call goes ACTIVE,
  // not during setupMedia/ringing. At ringing time WebRTC isn't established yet,
  // so the audio session isn't properly configured — especially on iOS.
  useEffect(() => {
    if (callStatus === "active" && !inCallManagerStarted.current) {
      inCallManagerStarted.current = true;
      const isVideo = call?.callType === "video";
      try {
        InCallManager.start({ media: isVideo ? "video" : "audio" });
        // Always force speaker on — without this, audio goes to earpiece and is inaudible
        InCallManager.setForceSpeakerphoneOn(true);
        console.log("[InCallManager] Started for", isVideo ? "video" : "audio", "call. Speaker forced ON.");
      } catch (e) {
        console.warn("[InCallManager] start error:", e.message);
      }
    }
  }, [callStatus, call?.callType]);

  const createPeerConnection = useCallback(async () => {
    if (pc.current) return pc.current;
    // If creation in progress, wait for it
    if (pcSetupPromise.current) {
      console.log("[WebRTC] Waiting for in-progress createPeerConnection...");
      return pcSetupPromise.current;
    }
    pcSetupPromise.current = (async () => {
    pc.current = new RTCPeerConnection(configuration);

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        const targetId = otherUserId();
        if (targetId) {
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
      if (state === "failed") {
        console.warn("[WebRTC] ICE failed — ending call.");
        cleanup();
        contextEndCall();
      }
    };

    pc.current.onconnectionstatechange = () => {
      const state = pc.current?.connectionState;
      console.log("[WebRTC] Connection state:", state);
      if (state === "failed" || state === "closed") {
        console.warn("[WebRTC] Connection failed/closed — ending call.");
        cleanup();
        contextEndCall();
      }
    };

    pc.current.ontrack = (event) => {
      const stream = event.streams?.[0];
      if (!stream) return;
      console.log("[WebRTC] ontrack fired! Stream tracks:", stream.getTracks().length);
      remoteStream.current = stream;
      setRemoteStreamURL(stream.toURL());
      setHasRemoteStream(true);
    };

    // Fallback: react-native-webrtc sometimes only fires onaddstream
    pc.current.onaddstream = (event) => {
      const stream = event.stream;
      if (!stream) return;
      console.log("[WebRTC] onaddstream fired! Stream tracks:", stream.getTracks().length);
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
  }, [call?.id, otherUserId, cleanup, contextEndCall]);

  const setupMedia = useCallback(async () => {
    // If stream already acquired, return immediately
    if (localStream.current) return localStream.current;
    // If acquisition already in progress, wait for it instead of spawning a 2nd getUserMedia
    if (mediaSetupPromise.current) {
      console.log("[Media] Waiting for in-progress getUserMedia...");
      return mediaSetupPromise.current;
    }
    // Start acquisition and store the promise so concurrent callers share it
    mediaSetupPromise.current = (async () => {
      const isVideo = call?.callType === "video";

      if (Platform.OS === "android") {
        try {
          console.log("[Media] Requesting Android Permissions...");
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          console.log("[Media] Permission Result:", granted);
          if (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] !==
              PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !==
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.warn("[Media] Permissions not granted by user.");
            // return null;  // <--- TEMPORARILY DISABLED early return to let basic constraints try!
          }
        } catch (err) {
          console.warn("[Media] Error requesting permissions on Android:", err);
        }
      }

      const sourceInfos = await mediaDevices.enumerateDevices();
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind === "videoinput" &&
          sourceInfo.facing === (isFrontCamera.current ? "front" : "environment")
        ) {
          videoSourceId = sourceInfo.deviceId;
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
        try {
          stream = await mediaDevices.getUserMedia({
            audio: true,
            video: isVideo,
          });
        } catch (err2) {
          console.warn("[Media] getUserMedia failed:", err2);
          return null;
        }
      }

      localStream.current = stream;
      const url = stream.toURL();
      setLocalStreamURL(url);
      setHasLocalStream(true);
      return stream;
    })();

    try {
      return await mediaSetupPromise.current;
    } finally {
      mediaSetupPromise.current = null;
    }  }, [call?.callType]);

  const addTracksToPeer = useCallback(async () => {
    const stream = await setupMedia();
    const peer = await createPeerConnection();

    if (stream) {
      stream.getTracks().forEach((track) => {
        const existingSenders = peer.getSenders();
        const alreadyAdded = existingSenders.some(
          (s) => s.track?.id === track.id,
        );
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
        // ✅ CRITICAL FIX: ALWAYS call addTracksToPeer before creating the answer.
        // If we skip this when pc.current exists but has no tracks yet,
        // the answer SDP will have no audio/video m-lines → no media flows.
        const peer = await addTracksToPeer();
        if (!peer) {
          console.error("[WebRTC] Failed to get peer connection for offer handling");
          return;
        }
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          console.log("[WebRTC] Answer created and sent. SDP has audio:", answer.sdp?.includes('m=audio'), "video:", answer.sdp?.includes('m=video'));
          socket.emit("call:signal", { callId: call?.id, payload: { answer } });
          await processQueuedCandidates();
        } catch (err) {
          console.error("[WebRTC] Error handling offer:", err);
        }
      } else if (payload.answer) {
        const peer = pc.current;
        if (!peer) return;
        if (peer.signalingState === "stable") {
          console.warn("[WebRTC] Ignored redundant answer (peer already stable)");
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
            // Ignore benign candidate errors (e.g. end-of-candidates)
          }
        } else {
          candidatesQueue.current.push(payload.candidate);
        }
      }
    };

    socket.on("call:signal", handleSignal);
    return () => socket.off("call:signal", handleSignal);
  }, [call?.id, processQueuedCandidates, addTracksToPeer]);

  const startCall = useCallback(async () => {
    const targetId = otherUserId();
    console.log("[startCall] fired. targetId:", targetId, "callId:", call?.id);
    if (!targetId) { console.warn("[startCall] no targetId, aborting."); return; }
    await addTracksToPeer();
    const peer = pc.current;
    if (!peer) { console.warn("[startCall] no PC after addTracksToPeer, aborting."); return; }
    try {
      console.log("[startCall] creating offer...");
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      console.log("[startCall] offer sent. callId:", call?.id, "audio:", offer.sdp?.includes("m=audio"), "video:", offer.sdp?.includes("m=video"));
      socket.emit("call:signal", { callId: call?.id, payload: { offer } });
    } catch (err) {
      console.error("[startCall] error:", err);
    }
  }, [addTracksToPeer, otherUserId, call?.id]);

  const acceptIncoming = useCallback(async () => {
    // Pre-warm media ONLY — do NOT create the PC here.
    // The offer signal handler creates the PC + adds tracks when the offer arrives.
    // Creating the PC here causes a race: both this and the signal handler call
    // addTracksToPeer() concurrently → two getUserMedia() calls → second one fails.
    console.log("[WebRTC] acceptIncoming: pre-warming media stream...");
    await setupMedia();
    console.log("[WebRTC] acceptIncoming: media ready, waiting for offer.");
  }, [setupMedia]);

  const toggleAudio = useCallback(() => {
    if (localStream.current) {
      localStream.current
        .getAudioTracks()
        .forEach((t) => (t.enabled = !t.enabled));
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStream.current) {
      localStream.current
        .getVideoTracks()
        .forEach((t) => (t.enabled = !t.enabled));
    }
  }, []);

  const toggleSpeaker = useCallback((isSpeaker) => {
    if (inCallManagerStarted.current) {
      InCallManager.setForceSpeakerphoneOn(isSpeaker);
    }
  }, []);

  const switchCamera = useCallback(() => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack._switchCamera();
        isFrontCamera.current = !isFrontCamera.current;
      }
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
    // ✅ Return state strings, not ref.current — these are reactive and always fresh
    localStream: localStream.current,   // kept for any direct stream access needs
    remoteStream: remoteStream.current, // kept for any direct stream access needs
    localStreamURL,   // ← use this for RTCView
    remoteStreamURL,  // ← use this for RTCView
    hasLocalStream,
    hasRemoteStream,
  };
}