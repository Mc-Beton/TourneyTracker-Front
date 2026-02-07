"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth/useAuth";
import { notificationApi, type Notification } from "@/lib/api/notifications";

export function NotificationBell() {
  const auth = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load unread count
  useEffect(() => {
    if (!auth.token) return;

    const loadUnreadCount = async () => {
      try {
        const count = await notificationApi.getUnreadCount(auth.token!);
        setUnreadCount(count);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [auth.token]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!isOpen || !auth.token) return;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const data = await notificationApi.getRecent(auth.token!, 5);
        setNotifications(data);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [isOpen, auth.token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!auth.token) return;

    // Mark as read
    if (!notification.read) {
      try {
        await notificationApi.markAsRead(notification.id, auth.token);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to tournament
    setIsOpen(false);
    router.push(`/tournaments/${notification.tournamentId}`);
  };

  const handleMarkAllRead = async () => {
    if (!auth.token) return;

    try {
      await notificationApi.markAllAsRead(auth.token);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "PARTICIPANT_REGISTERED":
        return "👤";
      case "ARMY_LIST_SUBMITTED":
        return "📄";
      case "PARTICIPATION_CONFIRMED":
        return "✅";
      case "PAYMENT_CONFIRMED":
        return "💰";
      case "ARMY_LIST_APPROVED":
        return "✅";
      case "ARMY_LIST_REJECTED":
        return "❌";
      default:
        return "🔔";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "teraz";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours}h temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString("pl-PL");
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm"
        aria-label="Powiadomienia"
      >
        <Bell className="w-5 h-5 text-gray-700 stroke-2" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-md">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border-2 border-gray-300 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="font-semibold text-lg text-gray-900">Powiadomienia</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto bg-white">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Ładowanie...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Brak powiadomień
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors text-left ${
                    !notification.read ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.tournamentName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
