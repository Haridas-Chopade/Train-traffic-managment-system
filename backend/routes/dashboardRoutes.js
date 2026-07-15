const express = require("express");
const Train = require("../models/Train");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();
    const activeTrains = trains.length;

    let delayedTrains = 0;
    let criticalAlerts = 0;

    for (let train of trains) {
      let isDelayed = false;
      const delayVal = train.delay || 0;

      try {
        const response = await axios.post("http://localhost:5001/predict", {
          speed: train.speed || 80,
          trafficDensity: train.trafficDensity || 40,
        });
        isDelayed = response.data.prediction === "Delayed";
      } catch (err) {
        isDelayed = (train.speed || 80) < 65 && (train.trafficDensity || 40) > 70;
      }

      if (isDelayed || delayVal > 0) {
        delayedTrains++;
      }

      const predictedDelay = isDelayed ? Math.max(10, delayVal + 12) : delayVal;
      if (predictedDelay > 20) {
        criticalAlerts++;
      }
    }

    res.json({
      activeTrains,
      delayedTrains,
      criticalAlerts,
      station: "MAQ",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;