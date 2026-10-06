import React, { useState, useEffect, useRef } from "react";
import api from "../api/client";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm">Notifications</h3>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-sky-600 hover:text-sky-500 font-semibold"
                >
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-500 font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default ${
                    !notif.isRead ? "bg-sky-50/50 dark:bg-sky-900/10" : ""
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <p className={`text-sm ${!notif.isRead ? "font-bold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-sky-500 hover:bg-sky-600 transition-colors"
                        title="Mark as read"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
