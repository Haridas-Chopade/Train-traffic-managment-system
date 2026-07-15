const mongoose = require('mongoose');

const TrainSchema = new mongoose.Schema({
  name: String,
  trainNo: { type: String, required: true },
  arrival: String,
  departure: String,
  status: String,
  speed: Number,
  trafficDensity: Number,
  delay: { type: Number, default: 0 },
  platform: { type: String, default: "1" },
  scheduledPlatform: { type: String, default: "1" },
  currentLat: Number,
  currentLng: Number,
  routeIndex: { type: Number, default: 0 },
  direction: { type: Number, default: 1 },
  route: [
    {
      lat: Number,
      lng: Number,
      name: String
    }
  ]
});

module.exports = mongoose.model('Train', TrainSchema);