require("dotenv").config();
const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
const Medicine = require("./models/Medicine");

const doctors = [
  // Paediatrics
  {
    name: "Dr. D. Ashwath",
    specialty: "Paediatrics",
    qualification: "MBBS, MD (Paediatrics)",
    designation: "Consultant - Paediatrician and Neonatologist",
    experience: "14+ Years",
    fee: 600,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
  },
  {
    name: "Dr. Rajendran. K",
    specialty: "Paediatrics",
    qualification: "MBBS, MD (Paediatrics)",
    designation: "Senior Paediatric Consultant",
    experience: "18+ Years",
    fee: 700,
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"],
  },
  {
    name: "Dr. Sujatha Chinnappan",
    specialty: "Paediatrics",
    qualification: "MRCPCH(UK), DCH(UK)",
    designation: "Consultant Paediatrician & Epilepsy Specialist",
    experience: "16+ Years",
    fee: 750,
    rating: 5.0,
    photoUrl: "https://images.unsplash.com/photo-1594824813566-78a9c375cb4b?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"],
  },

  // Cardiology
  {
    name: "Dr. Thomas Alexander",
    specialty: "Cardiology",
    qualification: "MD, DM, FACC, FICC, FCSI",
    designation: "Chief Cardiologist & HOD",
    experience: "22+ Years",
    fee: 900,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"],
  },
  {
    name: "Dr. R. Sureshkumar",
    specialty: "Cardiology",
    qualification: "MD, DM (Cardiology)",
    designation: "Senior Interventional Cardiologist",
    experience: "17+ Years",
    fee: 800,
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:00 AM", "11:30 AM", "02:00 PM", "05:30 PM"],
  },
  {
    name: "Dr. D.M.T. Saravanan",
    specialty: "Cardiology",
    qualification: "MBBS, MRCP (UK)",
    designation: "Consultant Cardiologist",
    experience: "12+ Years",
    fee: 700,
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:30 AM", "01:30 PM", "04:00 PM"],
  },
  {
    name: "Dr. J. Balakumaran",
    specialty: "Cardiology",
    qualification: "MBBS, MD (Internal Medicine), DM",
    designation: "Consultant Cardiologist",
    experience: "15+ Years",
    fee: 750,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:00 AM", "02:00 PM", "04:30 PM"],
  },
  {
    name: "Dr. Vinoth Doraiswamy",
    specialty: "Cardiology",
    qualification: "MD, MRCPCH (UK), FNB",
    designation: "Pediatric Cardiologist",
    experience: "13+ Years",
    fee: 750,
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["11:00 AM", "03:00 PM", "05:00 PM"],
  },

  // Gastroenterology
  {
    name: "Dr. S. Aravind",
    specialty: "Gastroenterology",
    qualification: "MBBS, MD, DM (Gastro)",
    designation: "Senior Gastroenterologist",
    experience: "16+ Years",
    fee: 800,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "11:30 AM", "02:30 PM", "05:00 PM"],
  },
  {
    name: "Dr. K. Sibi Thooran",
    specialty: "Gastroenterology",
    qualification: "MD, MRCP(UK), DM(Gastro), ESEGH",
    designation: "Consultant Gastroenterologist",
    experience: "14+ Years",
    fee: 750,
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "01:00 PM", "04:00 PM"],
  },

  // General Physician / Internal Medicine
  {
    name: "Dr. K.J. Joseph",
    specialty: "General Physician",
    qualification: "MBBS, MD (Medicine)",
    designation: "Senior Physician Consultant",
    experience: "25+ Years",
    fee: 650,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "03:00 PM"],
  },
  {
    name: "Dr. Smitha Ashok",
    specialty: "General Physician",
    qualification: "MBBS, DNB, DFM, D.Diab",
    designation: "Senior Physician Consultant",
    experience: "19+ Years",
    fee: 650,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1594824813566-78a9c375cb4b?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:30 AM", "02:00 PM", "04:30 PM"],
  },
  {
    name: "Dr. L. Jivan Chandra",
    specialty: "Internal Medicine",
    qualification: "Internal Medicine (MD)",
    designation: "Consultant Physician",
    experience: "11+ Years",
    fee: 600,
    rating: 4.7,
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "11:30 AM", "03:30 PM"],
  },

  // Neurology
  {
    name: "Dr. P. Baskar",
    specialty: "Neurology",
    qualification: "MBBS, MD, DM (Neurology)",
    designation: "Senior Consultant Neurologist",
    experience: "20+ Years",
    fee: 850,
    rating: 5.0,
    photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "12:00 PM", "04:00 PM"],
  },
  {
    name: "Dr. Rajesh Shankar Iyer",
    specialty: "Neurology",
    qualification: "MBBS, MD, DNB, DM (Neurology)",
    designation: "Consultant Neurologist & Epileptologist",
    experience: "18+ Years",
    fee: 850,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:00 AM", "11:00 AM", "03:00 PM"],
  },

  // Dermatology
  {
    name: "Dr. S. Pavithra",
    specialty: "Dermatology",
    qualification: "MBBS, MD (Dermatology)",
    designation: "Consultant Dermatologist",
    experience: "10+ Years",
    fee: 600,
    rating: 4.8,
    photoUrl: "https://images.unsplash.com/photo-1594824813566-78a9c375cb4b?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["10:00 AM", "02:00 PM", "05:00 PM"],
  },

  // ENT & Head-Neck
  {
    name: "Dr. M. Dhiwakar",
    specialty: "ENT",
    qualification: "MS, MRCS, FRCS, CCT",
    designation: "ENT & Head Neck Surgeon",
    experience: "15+ Years",
    fee: 700,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["09:30 AM", "12:30 PM", "04:00 PM"],
  },

  // Emergency Medicine
  {
    name: "Dr. K. Kesavamurthy",
    specialty: "Emergency Medicine",
    qualification: "MBBS, DEM",
    designation: "Emergency Care Lead",
    experience: "12+ Years",
    fee: 500,
    rating: 4.9,
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    availableSlots: ["24/7 On Duty"],
  },
];

const medicines = [
  { name: "Warfarin", genericName: "Warfarin sodium", category: "Anticoagulant" },
  { name: "Aspirin", genericName: "Acetylsalicylic acid", category: "NSAID / Antiplatelet" },
  { name: "Metformin", genericName: "Metformin hydrochloride", category: "Antidiabetic" },
  { name: "Ibuprofen", genericName: "Ibuprofen", category: "NSAID" },
  { name: "Lisinopril", genericName: "Lisinopril", category: "ACE inhibitor" },
  { name: "Simvastatin", genericName: "Simvastatin", category: "Statin" },
  { name: "Clarithromycin", genericName: "Clarithromycin", category: "Antibiotic" },
  { name: "Paracetamol", genericName: "Acetaminophen", category: "Analgesic" },
  { name: "Amoxicillin", genericName: "Amoxicillin trihydrate", category: "Antibiotic" },
  { name: "Omeprazole", genericName: "Omeprazole", category: "Proton Pump Inhibitor" },
  { name: "Atorvastatin", genericName: "Atorvastatin calcium", category: "Statin" },
  { name: "Amlodipine", genericName: "Amlodipine besylate", category: "Calcium Channel Blocker" },
];

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telemedicine";
  await mongoose.connect(uri);
  await Doctor.deleteMany({});
  await Medicine.deleteMany({});
  await Doctor.insertMany(doctors);
  await Medicine.insertMany(medicines);
  console.log("Seeded authentic hospital doctors and medicines successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
