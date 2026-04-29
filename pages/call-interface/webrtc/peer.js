import { RTCPeerConnection } from "react-native-webrtc";

/**
 * Creates a new RTCPeerConnection instance for Native (iOS/Android)
 * @param {Function} onIce - Callback for when a new ICE candidate is gathered
 * @returns {RTCPeerConnection}
 */
export const createPeer = (onIce) => {
  const configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  const pc = new RTCPeerConnection(configuration);

  // Native implementation of the icecandidate event listener
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      onIce(e.candidate);
    }
  };

  return pc;
};
