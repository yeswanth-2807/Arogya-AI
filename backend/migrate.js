const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/telemedicine').then(async () => {
  const Appointment = require('./models/Appointment');
  await Appointment.updateMany({status: 'upcoming'}, {$set: {status: 'BOOKED'}});
  await Appointment.updateMany({status: 'completed'}, {$set: {status: 'COMPLETED'}});
  await Appointment.updateMany({status: 'cancelled'}, {$set: {status: 'CANCELLED_BY_PATIENT'}});
  await Appointment.updateMany({status: 'expired'}, {$set: {status: 'MISSED_BY_PATIENT'}});
  console.log('Migration complete');
  process.exit(0);
});
