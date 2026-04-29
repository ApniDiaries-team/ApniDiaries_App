// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from '../api/axios';

export const followUser = (id) => api.post(`api/user/${id}/follow`);
export const unfollowUser = (id) => api.post(`api/user/${id}/unfollow`);
export const sendFriendRequest = (id) => api.post(`api/user/${id}/friend-request`);
export const acceptFriendRequest = (id) => api.post(`api/user/friend-request/${id}/accept`);
export const rejectFriendRequest = (id) => api.post(`api/user/friend-request/${id}/reject`);