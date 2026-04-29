import { RTCSessionDescription } from "react-native-webrtc";

/**
 * Creates an SDP offer and sets it as the Local Description
 * @param {RTCPeerConnection} pc
 * @returns {Promise<RTCSessionDescription>}
 */
export const createOffer = async (pc) => {
  try {
    const offer = await pc.createOffer();
    // In Native, we wrap the offer in RTCSessionDescription for stability
    await pc.setLocalDescription(new RTCSessionDescription(offer));
    return offer;
  } catch (error) {
    console.error("Failed to create offer:", error);
    throw error;
  }
};

/**
 * Sets the remote offer, creates an SDP answer, and sets it as Local Description
 * @param {RTCPeerConnection} pc
 * @param {Object} offer - The remote SDP offer
 * @returns {Promise<RTCSessionDescription>}
 */
export const createAnswer = async (pc, offer) => {
  try {
    // 1. Set the remote description first
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // 2. Create the answer
    const answer = await pc.createAnswer();

    // 3. Set the local description
    await pc.setLocalDescription(new RTCSessionDescription(answer));

    return answer;
  } catch (error) {
    console.error("Failed to create answer:", error);
    throw error;
  }
};
