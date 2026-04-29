// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from '../api/axios';

export const getFeed = (page, cursor) => {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', '10');
  return api.get(`api/posts?${params.toString()}`);
};

export const toggleLike = (id) => api.post(`api/posts/${id}/like`);

export const getUsersByPostLike = (id) => api.get(`api/posts/${id}/likes`);

/**
 * @param {object}   data       - post fields (content, destination, trip_types, etc.)
 * @param {object[]} files      - mediaItems array: [{ id, uri, type, fileSize }]
 * @param {object|null} music   - { uri, name, trimStart, trimEnd } or null
 */
export const createPostApi = (data, files = [], music = null) => {
  const formData = new FormData();

  // ── scalar / array fields ──────────────────────────────────────────────────
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });

  // ── media files ────────────────────────────────────────────────────────────
  // Web sends:  formData.append('media', file)              ← raw File/Blob
  // RN sends:   formData.append('media', { uri, name, type }) ← RN file object
  files.forEach((file, index) => {
    formData.append('media', {
      uri: file.uri,
      name: `media_${index}_${file.id || Date.now()}.${file.uri.split('.').pop()}`,
      type: file.type === 'video' ? 'video/mp4' : 'image/jpeg',
    });
  });

  // ── music ──────────────────────────────────────────────────────────────────
  // Web sends:  music.file  (a File/Blob object)
  // RN sends:   music.uri   (a local file URI string)
  if (music?.uri) {
    formData.append('music', {
      uri: music.uri,
      name: music.name ? `${music.name}.mp3` : `music_${Date.now()}.mp3`,
      type: 'audio/mpeg',
    });
    if (music.name)              formData.append('music_name',        music.name);
    if (music.trimStart != null) formData.append('music_trim_start',  String(music.trimStart));
    if (music.trimEnd   != null) formData.append('music_trim_end',    String(music.trimEnd));
  }

  return api.post('api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const addComment = (id, content) =>
  api.post(`api/posts/${id}/comment`, { content });

export const getPostLikers = (postId) =>
  api.get(`api/posts/${postId}/likes`);

export const deleteComment = (postId, commentId) =>
  api.delete(`api/posts/${postId}/comments/${commentId}`);

export const updatePost = (id, content) =>
  api.put(`api/posts/${id}`, { content });

export const deletePost = (id) => api.delete(`api/posts/${id}`);

export const getComments = (id) => api.get(`api/posts/${id}/comment`);

export const getCityPostCounts = () => api.get('api/posts/city-counts');