const express = require("express");
const Train = require("../models/Train");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();

    const predictions = await Promise.all(
      trains.map(async (train) => {
        let aiPrediction = "On Time";
        let confidence = 95;

        try {
          const response = await axios.post("http://localhost:5001/predict", {
            speed: train.speed || 80,
            trafficDensity: train.trafficDensity || 40,
          });
          aiPrediction = response.data.prediction;
          confidence = aiPrediction === "Delayed" ? 88 : 94;
        } catch (err) {
          // Rule-based fallback if Flask server is offline
          if ((train.speed || 80) < 65 && (train.trafficDensity || 40) > 70) {
            aiPrediction = "Delayed";
            confidence = 80;
          } else {
            aiPrediction = "On Time";
            confidence = 85;
          }
        }

        const currentDelay = train.delay || 0;
        const predictedDelay =
          aiPrediction === "Delayed"
            ? Math.max(10, currentDelay + 12)
            : currentDelay;

        return {
          train: train.name,
          trainNo: train.trainNo,
          speed: train.speed || 80,
          trafficDensity: train.trafficDensity || 40,
          currentDelay: currentDelay,
          predictedDelay: predictedDelay,
          confidence: confidence,
          status: aiPrediction,
        };
      })
    );

    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;