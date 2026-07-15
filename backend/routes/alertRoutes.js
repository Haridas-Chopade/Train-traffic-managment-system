const express = require("express");
const Train = require("../models/Train");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();

    const alerts = trains
      .filter((t) => t.delay > 0)
      .map((t) => ({
        train: t.name,
        delay: t.delay,
        platform: t.platform,
      }));

    res.json(alerts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;