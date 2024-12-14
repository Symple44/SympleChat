// src/services/NotificationSystem.js
import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      createdAt: new Date(),
      ...notification
    };

    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto-suppression après délai
    if (notification.duration !== Infinity) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));

export { useNotificationStore };

// Composant pour afficher les notifications
export const Notifications = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm transform transition-all 
            ${notification.type === 'error' ? 'bg-red-100 text-red-800' : 
              notification.type === 'success' ? 'bg-green-100 text-green-800' : 
              'bg-blue-100 text-blue-800'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              {notification.title && (
                <h4 className="font-medium mb-1">{notification.title}</h4>
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
