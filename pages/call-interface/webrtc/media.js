import { mediaDevices } from "react-native-webrtc";

/**
 * Native version of getMedia
 * @param {string} type - 'video' or 'audio'
 * @returns {Promise<MediaStream>}
 */
export const getMedia = async (type) => {
  try {
    const isVideo = type === "video";

    const constraints = {
      audio: true,
      video: isVideo
        ? {
            facingMode: "user", // Uses the front camera by default
            width: { min: 640, ideal: 1280 },
            height: { min: 480, ideal: 720 },
            frameRate: 30,
          }
        : false,
    };

    return await mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("Error accessing media devices:", error);
    throw error;
  }
};
