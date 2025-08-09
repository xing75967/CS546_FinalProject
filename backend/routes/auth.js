

import express from "express";
import { connectToDb } from "../config/mongoConnection.js";
import bcrypt from "bcryptjs";
import { validateUserRegistration, validateUserLogin } from "../validations/users.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const errors = validateUserRegistration(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const db = await connectToDb();
    const existing = await db.collection("users").findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(req.body.password, 10);
    const newUser = {
      email: req.body.email,
      password: hashed,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      role: "user",
      created_at: new Date().toISOString().slice(0, 10),
      bookmarks: [],
      two_factor_enabled: false,
    };
    const result = await db.collection("users").insertOne(newUser);
    req.session.user = { _id: result.insertedId, email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, role: "user" };
    res.json({ message: "Registration successful", user: req.session.user });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const errors = validateUserLogin(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const db = await connectToDb();
    const user = await db.collection("users").findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    req.session.user = { _id: user._id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role };
    res.json({ message: "Login successful", user: req.session.user });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;
