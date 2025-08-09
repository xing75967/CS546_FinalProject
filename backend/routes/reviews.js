
import express from "express";
import { connectToDb } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";
import { validateReview } from "../validations/reviews.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

router.post("/", requireLogin, async (req, res, next) => {
  try {
    const errors = validateReview(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const db = await connectToDb();

    const review = {
      user_id: new ObjectId(req.session.user._id),
      tool_id: new ObjectId(req.body.tool_id),
      title: req.body.title || "",
      content: req.body.content,
      ratings: req.body.ratings,
      created_at: new Date().toISOString().slice(0, 10),
      comments: [],
    };

    await db.collection("reviews").insertOne(review);

    // 重新计算工具评分scores recalculation 
    const reviews = await db.collection("reviews").find({ tool_id: review.tool_id }).toArray();

    const ratingSum = reviews.reduce(
      (acc, r) => {
        acc.functionality += r.ratings.functionality;
        acc.usability += r.ratings.usability;
        acc.value += r.ratings.value;
        return acc;
      },
      { functionality: 0, usability: 0, value: 0 }
    );

    const count = reviews.length;
    const avgRatings = {
      functionality: (ratingSum.functionality / count).toFixed(2),
      usability: (ratingSum.usability / count).toFixed(2),
      value: (ratingSum.value / count).toFixed(2),
      count,
    };

    await db.collection("tools").updateOne(
      { _id: review.tool_id },
      { $set: { ratings: avgRatings } }
    );

    res.json({ message: "Review added" });
  } catch (e) {
    next(e);
  }
});

export default router;
