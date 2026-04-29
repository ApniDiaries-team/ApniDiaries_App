// CommonJS stub — replaces react-native-webrtc in Expo Go
const RTCPeerConnection = class {
  constructor() {}
  createOffer() {
    return Promise.resolve({});
  }
  createAnswer() {
    return Promise.resolve({});
  }
  setLocalDescription() {
    return Promise.resolve();
  }
  setRemoteDescription() {
    return Promise.resolve();
  }
  addIceCandidate() {
    return Promise.resolve();
  }
  addTrack() {}
  close() {}
  onicecandidate = null;
  ontrack = null;
};

const RTCSessionDescription = class {
  constructor(init) {
    Object.assign(this, init);
  }
};

const RTCIceCandidate = class {
  constructor(init) {
    Object.assign(this, init);
  }
};

const mediaDevices = {
  getUserMedia: async () => null,
  enumerateDevices: async () => [],
};

const RTCView = () => null;

module.exports = {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
  RTCView,
  default: {},
};
