const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const SystemSettings = require('../models/SystemSettings');
const Notification = require('../models/Notification');
const RefundService = require('../services/RefundService');

// Helper to parse date and time strings into a comparable Date object
function getAppointmentDateTime(dateStr, timeStr) {
  // Check if it has AM/PM
  const amPmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hours = 0;
  let minutes = 0;
  
  if (amPmMatch) {
    hours = parseInt(amPmMatch[1], 10);
    minutes = parseInt(amPmMatch[2], 10);
    const modifier = amPmMatch[3].toUpperCase();
    
    if (hours === 12) {
      hours = modifier === "AM" ? 0 : 12;
    } else if (modifier === "PM") {
      hours += 12;
    }
  } else {
    // Fallback for 24-hour HH:mm
    const parts = timeStr.split(":");
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
  }

  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function runCronJob() {
  console.log('[CRON] Running appointment status check...');
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({});

    const now = new Date();
    
    // Find all BOOKED or CONFIRMED appointments
    const activeAppointments = await Appointment.find({
      status: { $in: ["BOOKED", "CONFIRMED"] }
    });

    for (let apt of activeAppointments) {
      const aptTime = getAppointmentDateTime(apt.date, apt.time);
      const diffMinutes = (now.getTime() - aptTime.getTime()) / (1000 * 60);

      // Check Grace Period Expiration (e.g. they are 15+ minutes late)
      if (diffMinutes > settings.gracePeriodMinutes) {
        
        // If the appointment is already completed or ended, ignore.
        if (apt.roomStatus === "ended") continue;

        const patientJoined = !!apt.patientJoinedAt;
        const doctorJoined = !!apt.doctorJoinedAt;

        if (patientJoined && !doctorJoined) {
          // Patient was there, doctor never showed up.
          apt.status = "MISSED_BY_DOCTOR";
        } else if (!patientJoined && doctorJoined) {
          // Doctor was there, patient never showed up.
          apt.status = "MISSED_BY_PATIENT";
        } else if (!patientJoined && !doctorJoined) {
          // Neither showed up. Default to patient fault, or we could have a MISSED_BY_BOTH.
          apt.status = "MISSED_BY_PATIENT";
        } else {
          // Both joined, but they forgot to click "End Call". Let's assume it completed naturally.
          apt.status = "COMPLETED";
          apt.roomStatus = "ended";
        }

        await apt.save();
          
          await Notification.create({
            userId: apt.patientId,
            userType: "User",
            title: apt.status === "MISSED_BY_DOCTOR" ? "Doctor Missed Appointment" : "Appointment Missed",
            message: apt.status === "MISSED_BY_DOCTOR" 
              ? `Dr. ${apt.doctorName} did not join. You can now reschedule or claim a full refund.` 
              : `You missed your appointment with Dr. ${apt.doctorName}.`,
            relatedId: apt._id
          });

          // Trigger Refund Policy if applicable
          if (apt.status === "MISSED_BY_PATIENT" && settings.missedAppointmentRefundPolicy !== "NO_REFUND") {
            try {
              await RefundService.requestRefund(apt._id, "PATIENT_NO_SHOW");
            } catch(e) {
              console.error(`Refund error for ${apt._id}:`, e);
            }
          }
          // Note: If MISSED_BY_DOCTOR, we leave it pending so the patient can choose to Reschedule or get a Full Refund.
        }
      }
      
      // Reminders (24h, 1h, 15m)
      // Since it runs frequently, we use flags or strict time bounds. 
      // For simplicity in this demo, we'll skip complex flag state and focus on the expiration logic.
  } catch (error) {
    console.error('[CRON] Error running job:', error);
  }
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', runCronJob);

module.exports = { runCronJob };
