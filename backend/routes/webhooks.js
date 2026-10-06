const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const AuditLog = require("../models/AuditLog");

// Example generic webhook endpoint for payments (e.g., Stripe)
router.post("/payment", async (req, res, next) => {
  try {
    const { eventId, type, data } = req.body;
    
    // 1. IDEMPOTENCY: Check if webhook was already processed by querying AuditLogs
    const existingLog = await AuditLog.findOne({ resourceId: eventId, action: "WEBHOOK_PROCESSED" });
    if (existingLog) {
      return res.status(200).json({ message: "Webhook already processed" });
    }

    if (type === "PAYMENT_SUCCESS") {
      const { appointmentId, transactionId } = data;
      const apt = await Appointment.findById(appointmentId);
      
      if (apt && apt.paymentStatus !== "PAID") {
        apt.paymentStatus = "PAID";
        apt.status = "CONFIRMED";
        apt.paymentId = transactionId;
        await apt.save();

        await AuditLog.create({
          action: "PAYMENT_SUCCESSFUL",
          resource: "Appointment",
          resourceId: apt._id,
          newValue: { paymentStatus: "PAID", status: "CONFIRMED" }
        });
      }
    }

    // Mark webhook as processed
    await AuditLog.create({
      action: "WEBHOOK_PROCESSED",
      resource: "WebhookEvent",
      resourceId: eventId || new mongoose.Types.ObjectId(), // Usually a string ID from Stripe
      newValue: { type }
    });

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

module.exports = router;
