const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const SystemSettings = require("../models/SystemSettings");
const Notification = require("../models/Notification");

class RefundService {
  /**
   * Calculate refund amount based on settings and logic
   */
  static async calculateRefundAmount(appointment, reason) {
    // Simulated base amount (since we don't store actual price in appointment initially, let's assume 500)
    // In a real app, `appointment.pricePaid` would be queried.
    const pricePaid = 500; 

    // Retrieve settings (create default if missing)
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});

    if (reason === "DOCTOR_NO_SHOW") {
      return settings.doctorNoShowRefundPolicy === "FULL_REFUND" ? pricePaid : (pricePaid * (settings.partialRefundPercentage / 100));
    }

    if (reason === "PATIENT_CANCELLED_BEFORE_DEADLINE") {
      return pricePaid; // Usually full refund if cancelled far in advance
    }

    if (reason === "PATIENT_NO_SHOW") {
      if (settings.missedAppointmentRefundPolicy === "NO_REFUND") return 0;
      if (settings.missedAppointmentRefundPolicy === "FULL_REFUND") return pricePaid;
      return pricePaid * (settings.partialRefundPercentage / 100);
    }

    return 0;
  }

  /**
   * Request a refund (requires admin approval)
   */
  static async requestRefund(appointmentId, reason) {
    // 1. Fetch appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // 2. Validate state - prevent duplicate refunds
    if (["REFUNDED", "REFUND_PENDING", "REFUND_FAILED"].includes(appointment.paymentStatus)) {
      throw new Error(`Refund already processed or pending. Current status: ${appointment.paymentStatus}`);
    }

    // 3. Calculate amount
    const refundAmount = await this.calculateRefundAmount(appointment, reason);
    if (refundAmount <= 0) {
      appointment.paymentStatus = "PAID";
      await appointment.save();
      return { success: false, message: "Not eligible for refund based on current policy" };
    }

    // 4. Mark as pending admin approval
    appointment.paymentStatus = "REFUND_PENDING";
    appointment.refundAmount = refundAmount;
    appointment.cancellationReason = reason;
    await appointment.save();

    // Log the request for admin audit
    const AuditLog = require("../models/AuditLog");
    await AuditLog.create({
      action: "REFUND_REQUESTED",
      resource: "Appointment",
      resourceId: appointment._id,
      newValue: { refundAmount, reason }
    });

    return { success: true, status: "REFUND_PENDING", amount: refundAmount };
  }

  /**
   * Actually execute the refund via Gateway (Admin only)
   */
  static async executeRefund(appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new Error("Appointment not found");
    if (appointment.paymentStatus !== "REFUND_PENDING") {
      throw new Error("Appointment is not pending a refund");
    }

    const idempotencyKey = `ref_${appointment._id}_${Date.now()}`;
    appointment.idempotencyKey = idempotencyKey;
    await appointment.save();

    try {
      const gatewayResponse = await this.simulateGatewayRefund(idempotencyKey, appointment.refundAmount);

      if (gatewayResponse.success) {
        appointment.paymentStatus = "REFUNDED";
        appointment.refundId = gatewayResponse.transactionId;
        await appointment.save();

        await Notification.create({
          userId: appointment.patientId,
          userType: "User",
          title: "Refund Approved",
          message: `Your refund of ₹${appointment.refundAmount} has been approved and processed.`,
          type: "REFUND",
          relatedId: appointment._id
        });

        const AuditLog = require("../models/AuditLog");
        await AuditLog.create({
          action: "REFUND_EXECUTED",
          resource: "Appointment",
          resourceId: appointment._id,
          newValue: { refundId: gatewayResponse.transactionId }
        });

        return { success: true, refundId: gatewayResponse.transactionId };
      } else {
        throw new Error("Gateway rejected refund");
      }
    } catch (err) {
      appointment.paymentStatus = "REFUND_FAILED";
      await appointment.save();
      throw new Error("Refund failed to process at the gateway.");
    }
  }

  static async simulateGatewayRefund(idempotencyKey, amount) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (Math.random() > 0.01) {
      return { success: true, transactionId: `txn_ref_${Math.random().toString(36).substr(2, 9)}` };
    }
    return { success: false };
  }
}

module.exports = RefundService;
