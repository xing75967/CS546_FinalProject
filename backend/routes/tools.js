

import express from "express";
import { connectToDb } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";
import { validateTool } from "../validations/tools.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireLogin, async (req, res, next) => {
  try {
    const errors = validateTool(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const db = await connectToDb();

    const newTool = {
      name: req.body.name,
      official_url: req.body.official_url,
      description: req.body.description || "",
      base_model: req.body.base_model || "",
      hardware_requirements: req.body.hardware_requirements || [],
      supported_formats: req.body.supported_formats || [],
      tool_approved: false, // 需审核
      category: req.body.category,
      subcategories: req.body.subcategories || [],
      ratings: { functionality: 0, usability: 0, value: 0, count: 0 },
      views: 0,
      bookmarks: 0,
      submission_date: new Date().toISOString().slice(0, 10),
      submitted_by: new ObjectId(req.session.user._id),
    };

    const result = await db.collection("tools").insertOne(newTool);
    res.json({ message: "Tool submitted for review", toolId: result.insertedId });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const toolId = req.params.id;
    if (!ObjectId.isValid(toolId)) return res.status(400).json({ error: "Invalid tool ID" });
    const db = await connectToDb();
    const tool = await db.collection("tools").findOne({ _id: new ObjectId(toolId) });
    if (!tool) return res.status(404).json({ error: "Tool not found" });
    // 增加浏览数
    await db.collection("tools").updateOne({ _id: tool._id }, { $inc: { views: 1 } });
    res.json(tool);
  } catch (e) {
    next(e);
  }
});

export default router;
