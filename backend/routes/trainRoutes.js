const express = require('express');

const router = express.Router();

const Train = require('../models/Train');

router.get('/', async (req, res) => {
  try {
    const trains = await Train.find();

    res.json(trains);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const train = new Train(req.body);

    const savedTrain = await train.save();

    res.status(201).json(savedTrain);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    await Train.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Train deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedTrain = await Train.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedTrain);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;