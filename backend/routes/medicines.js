const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");

router.post("/", async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
});

// Search medicines by name (for the interaction checker's autocomplete)
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }
    const medicines = await Medicine.find(filter).limit(20);
    res.json(medicines);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
