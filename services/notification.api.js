// React Native compatible — pure axios wrappers, no browser/DOM APIs used.
import api from '../api/axios'

export const getNotifications = () => api.get('api/notifications')

export const markNotificationRead = (id) => api.patch(`api/notifications/${id}/read`)

export const getUnreadCount = () => api.get('api/notifications/unread-count')

export const markAllRead = () => api.put('api/notifications/mark-all-read')

export const clearAllNotifications = () => api.delete('api/notifications/clear-all')
