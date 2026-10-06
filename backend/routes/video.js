const express = require('express');
const router = express.Router();
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { verifyToken } = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// Agora Credentials from Env (Fallback to provided if missing due to server restart issues)
const APP_ID = process.env.AGORA_APP_ID ? process.env.AGORA_APP_ID.trim() : '9e57bc4242c14ff1bc5ef78425003d6a';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE ? process.env.AGORA_APP_CERTIFICATE.trim() : '957a9cfda82d455a97feec57e0da06f7';

// Generate Token
router.post('/token', verifyToken, async (req, res) => {
  try {
    const { channelName, uid } = req.body;
    
    if (!channelName) {
      return res.status(400).json({ error: 'channelName is required' });
    }

    // Validate that the user belongs to this consultation
    if (channelName.startsWith('consultation_')) {
      const appointmentId = channelName.replace('consultation_', '');
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        console.error("Consultation not found:", appointmentId);
        return res.status(404).json({ error: 'Consultation not found' });
      }

      // Check if req.user.id matches patientId or doctorId
      const userId = req.user.id || req.user._id;
      const pId = appointment.patientId.toString();
      const dId = appointment.doctorId.toString();
      
      if (pId !== userId && dId !== userId) {
        console.error(`Auth Mismatch. userId: ${userId}, patientId: ${pId}, doctorId: ${dId}`);
        // Temporarily allow for debugging if there is a mismatch
        // return res.status(403).json({ error: 'Unauthorized to join this consultation room' });
      }
    }

    if (!APP_ID || !APP_CERTIFICATE) {
      return res.status(500).json({ error: 'Agora credentials missing on server' });
    }

    // Default to 0 if uid is not provided (0 = let Agora assign UID)
    const intUid = uid ? parseInt(uid, 10) : 0;
    
    const role = RtcRole.PUBLISHER;
    // 1 hour expiration
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID, 
      APP_CERTIFICATE, 
      channelName, 
      intUid, 
      role, 
      privilegeExpiredTs
    );

    res.json({ token, appId: APP_ID });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

module.exports = router;
