// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from '../api/axios';

export const getUserSettings = () => api.get('api/settings');

export const updateUserSettings = (data) => api.put('api/settings', data);
