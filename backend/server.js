require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const usersRouter = require("./routes/users");
const doctorsRouter = require("./routes/doctors");
const adminRouter = require("./routes/admin");
const appointmentsRouter = require("./routes/appointments");
const healthRecordsRouter = require("./routes/healthRecords");
const medicinesRouter = require("./routes/medicines");
const interactionChecksRouter = require("./routes/interactionChecks");
const symptomCheckRouter = require("./routes/symptomCheck");
const prescriptionsRouter = require("./routes/prescriptions");
const videoRouter = require("./routes/video");
const chatRouter = require("./routes/chat");
const webhooksRouter = require("./routes/webhooks");
const notificationsRouter = require("./routes/notifications");

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use("/api/users", usersRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/health-records", healthRecordsRouter);
app.use("/api/medicines", medicinesRouter);
app.use("/api/interaction-checks", interactionChecksRouter);
app.use("/api/symptom-check", symptomCheckRouter);
app.use("/api/prescriptions", prescriptionsRouter);
app.use("/api/video", videoRouter);
app.use("/api/agora", videoRouter);
app.use("/api/chat", chatRouter);
app.use("/api/webhooks", webhooksRouter);
app.use("/api/notifications", notificationsRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/telemedicine";
  mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      console.error("The API is running, but database routes will fail until MongoDB is reachable.");
    });
}

// Import and start cron job
require("./workers/cronJob");

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  connectToDatabase();
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected — will retry automatically.");
});
