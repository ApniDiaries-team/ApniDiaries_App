import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { clearAllNotifications, getNotifications, markAllRead as apiMarkAllRead, markNotificationRead } from '../services/notification.api';
import { AppContext } from './AppContext';
import { socket } from '../lib/sockets';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const isFetching = useRef(false);

  const formatNotification = useCallback((n) => ({
    id: n.id,
    type: n.type,
    userId: n.actor_id,
    userName: n.actor_name,
    avatar: n.actor_profile_photo || n.actor_profile_pic,
    name: n.actor_username,
    postId: n.post_id,
    friendRequestId: n.friend_request_id,
    isRead: n.is_read,
    isResponded: n.type === 'friend_request' ? n.is_responded : true,
    message: n.message,
    previewText: n.preview_text,
    threadId: n.thread_id || n.threadId || null,
    timestamp: new Date(n.created_at),
  }), []);

  const refreshNotifications = useCallback(async () => {
    if (isAuthLoading || !user || isFetching.current) return;
    
    isFetching.current = true;
    try {
      setIsLoading(true);
      const res = await getNotifications();
      if (res?.data?.success) {
        const formatted = res.data.notifications.map(formatNotification);
        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.isRead).length);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Refresh notifications error:', error);
      }
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [user, isAuthLoading, formatNotification]);

  const markAllRead = useCallback(async () => {
    try {
      await apiMarkAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  }, []);

  const markOneRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark one read error:', error);
    }
  }, []);

  const respondToFriendRequest = useCallback((notificationId, accepted) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isResponded: true, isRead: true } : n
    ));
    setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
    });
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Clear all error:', error);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [user, isAuthLoading, refreshNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const handleUpdate = () => refreshNotifications();
    
    socket.on('notification:new', handleUpdate);
    socket.on('friend:accepted', handleUpdate);
    socket.on('friend:rejected', handleUpdate);

    return () => {
      socket.off('notification:new', handleUpdate);
      socket.off('friend:accepted', handleUpdate);
      socket.off('friend:rejected', handleUpdate);
    };
  }, [user?.id, refreshNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      markAllRead,
      markOneRead,
      respondToFriendRequest,
      clearAll,
      refreshNotifications,
      setNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
