const express = require("express");
const Train = require("../models/Train");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trains = await Train.find();

    const data = [
      {
        name: "Active",
        value: trains.length,
      },
      {
        name: "Delayed",
        value: trains.filter(
          (t) => t.delay > 0
        ).length,
      },
      {
        name: "Critical",
        value: trains.filter(
          (t) => t.delay > 30
        ).length,
      },
    ];

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;