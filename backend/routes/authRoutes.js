const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });

    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashed
    });

    await user.save();

    res.json({
      message: "User created successfully"
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({
      message: "Invalid username"
    });
  }

  const valid = await bcrypt.compare(
    password,
    user.password
  );

  if (!valid) {
    return res.status(400).json({
      message: "Invalid password"
    });
  }

  res.json({
    success: true,
    username: user.username
  });
});
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working"
  });
});

router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});
module.exports = router;