const express = require("express");
const Train = require("../models/Train");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();
    res.json({
      success: true,
      occupancy: global.latestTrackOccupancy || { "1": [], "2": [], "3": [], "4": [] },
      logs: global.latestDecisionLogs || [],
      trains: trains
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
