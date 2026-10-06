const Notification = require("../models/Notification");

class NotificationService {
  /**
   * Send a notification to a specific user
   * @param {Object} params
   * @param {String} params.userId - ObjectId of the user/doctor/admin
   * @param {String} params.userType - "User", "Doctor", "Admin"
   * @param {String} params.title - Title of the notification
   * @param {String} params.message - Detailed message
   * @param {String} params.type - "SYSTEM", "REMINDER", "REFUND", "ALERT"
   * @param {String} params.relatedId - Optional ObjectId related to the event (e.g. appointment ID)
   */
  static async send({ userId, userType, title, message, type = "SYSTEM", relatedId = null }) {
    try {
      const notification = new Notification({
        userId,
        userType,
        title,
        message,
        type,
        relatedId
      });
      await notification.save();
      return notification;
    } catch (err) {
      console.error("Failed to send notification:", err);
      // Fail silently to not break main application flows
    }
  }
}

module.exports = NotificationService;
