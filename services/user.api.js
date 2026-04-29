// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from "../api/axios";

export const followUser = (id) => api.post(`/api/user/${id}/follow`);

export const unFollowUser = (id) => api.post(`/api/user/${id}/unfollow`);

export const sendFriendRequest = (id) =>
  api.post(`/api/user/${id}/friend-request`);

export const removeFriend = (id) => api.delete(`/api/user/friends/${id}/remove`);

export const acceptFriend = (id) =>
  api.post(`/api/user/friend-request/${id}/accept`);

export const declineFriend = (id) =>
  api.post(`/api/user/friend-request/${id}/reject`);

export const getUserDetails = (id) => api.get(`/api/user/${id}/profile`);

export const getUserPosts = (id) => api.get(`/api/user/${id}/posts`);

export const blockUser = (id) => api.post(`/api/user/block/${id}`);

export const UnBlockUser = (id) => api.delete(`/api/user/block/${id}`);

export const getPersonalDetails = () => api.get(`/api/user/myProfile`);

export const updateUserDetails = (data) =>
  api.patch("/api/user/profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const verifyAccountApi = (data) =>
  api.post("/api/user/verify-account", data);

export const getFollowersList = (id) =>
  api.get(`/api/user/followers-list/${id}`);

export const getFollowingList = (id) =>
  api.get(`/api/user/following-list/${id}`);

export const getFriendsList = (id) => api.get(`/api/user/friends-list/${id}`);

export const getSuggestedFriendsList = (id) =>
  api.get(`/api/user/suggested-friends/${id}`);

export const searchUser = (query, page = 1, limit = 10) =>
  api.get(`/api/user/search`, {
    params: { q: query, page, limit },
  });
