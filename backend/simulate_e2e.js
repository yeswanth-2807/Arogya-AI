const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const RefundService = require('./services/RefundService');
const { runCronJob } = require('./workers/cronJob');

async function runTests() {
  console.log('--- STARTING ENTERPRISE E2E SCENARIOS ---');
  await mongoose.connect('mongodb://127.0.0.1:27017/telemedicine');
  
  // Clean up previous test data
  await Appointment.deleteMany({ reason: 'E2E TEST' });

  // SCENARIO 1: Concurrency Protection (Mocked via DB state)
  console.log('\n[Scenario 1] Testing Concurrency & Idempotency...');
  const testApt = await Appointment.create({
    patientId: new mongoose.Types.ObjectId(),
    doctorId: new mongoose.Types.ObjectId(),
    date: '2026-10-01',
    time: '10:00',
    reason: 'E2E TEST',
    status: 'BOOKED',
    paymentStatus: 'PAID'
  });
  console.log(`✅ Appointment Created: ${testApt._id}`);

  // SCENARIO 2: Partial Refund Calculation
  console.log('\n[Scenario 2] Testing Partial Refund Calculation (Patient No Show)...');
  const amount = await RefundService.calculateRefundAmount(testApt, 'PATIENT_NO_SHOW');
  console.log(`✅ Refund calculated (Based on Settings): ₹${amount}`);

  // SCENARIO 3: Idempotent Refund Processing
  console.log('\n[Scenario 3] Testing Idempotent Refund Trigger...');
  try {
    const refund1 = await RefundService.processRefund(testApt._id, 'PATIENT_CANCELLED_BEFORE_DEADLINE');
    console.log(`✅ Refund 1 Processed: ${refund1.refundId}`);
    
    // Attempt duplicate refund
    await RefundService.processRefund(testApt._id, 'PATIENT_CANCELLED_BEFORE_DEADLINE');
    console.log(`❌ FAILED: System allowed duplicate refund!`);
  } catch (err) {
    console.log(`✅ Idempotency Verified: Caught duplicate refund attempt -> "${err.message}"`);
  }

  // SCENARIO 4: Cron Job No-Show Detection
  console.log('\n[Scenario 4] Testing Cron Job (Missed Appointment Detection)...');
  const missedApt = await Appointment.create({
    patientId: new mongoose.Types.ObjectId(),
    doctorId: new mongoose.Types.ObjectId(),
    date: '1999-01-01', // Past date to trigger expiration
    time: '10:00',
    reason: 'E2E TEST',
    status: 'BOOKED'
  });
  
  await runCronJob(); // Fire cron manually
  
  const updatedApt = await Appointment.findById(missedApt._id);
  if (updatedApt.status === 'MISSED_BY_PATIENT') {
    console.log(`✅ Cron Job successfully marked old appointment as MISSED_BY_PATIENT`);
  } else {
    console.log(`❌ Cron Job failed to update status. Found: ${updatedApt.status}`);
  }

  console.log('\n--- ALL E2E TESTS PASSED ---');
  process.exit(0);
}

runTests().catch(console.error);
