const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all messages for an appointment
router.get('/:appointmentId', async (req, res) => {
  try {
    const messages = await Message.find({ appointmentId: req.params.appointmentId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { appointmentId, sender, text, time } = req.body;
    
    if (!appointmentId || !sender || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMessage = new Message({
      appointmentId,
      sender,
      text,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
