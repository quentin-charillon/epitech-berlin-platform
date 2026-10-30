const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error("GET /api/users error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name, role: "STAFF" });

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("POST /api/users error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["ADMIN", "STAFF"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      "-password"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error("PATCH /api/users/:id/role error", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE /api/users/:id error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
