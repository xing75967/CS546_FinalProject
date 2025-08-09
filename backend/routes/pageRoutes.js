
import express from "express";
import { connectToDb } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const db = await connectToDb();
    const popularTools = await db
      .collection("tools")
      .find({ tool_approved: true })
      .sort({ "ratings.functionality": -1, views: -1, bookmarks: -1 })
      .limit(10)
      .toArray();

    res.render("home", { popularTools, user: req.session.user || null });
  } catch (err) {
    next(err);
  }
});

router.get("/tools", async (req, res, next) => {
  try {
    const db = await connectToDb();
    const { category, search } = req.query;

    const filter = { tool_approved: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const tools = await db.collection("tools").find(filter).limit(50).toArray();

    const categories = await db.collection("tools").distinct("category");

    res.render("tools", {
      tools,
      categories,
      selectedCategory: category,
      searchTerm: search,
      user: req.session.user || null,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/tools/:id", async (req, res, next) => {
  try {
    const db = await connectToDb();
    const toolId = req.params.id;
    if (!ObjectId.isValid(toolId)) return res.status(400).send("Invalid tool ID");

    const tool = await db.collection("tools").findOne({ _id: new ObjectId(toolId) });
    if (!tool) return res.status(404).send("Tool not found");

    const reviews = await db.collection("reviews").find({ tool_id: new ObjectId(toolId) }).toArray();

    res.render("toolDetail", { tool, reviews, user: req.session.user || null });
  } catch (err) {
    next(err);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    if (!req.session.user) return res.redirect("/auth/login");
    const db = await connectToDb();
    const userId = req.session.user._id;

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).send("User not found");

    const bookmarkTools = await Promise.all(
      user.bookmarks?.map(async (folder) => {
        const tools = await db
          .collection("tools")
          .find({ _id: { $in: folder.tools.map((id) => new ObjectId(id)) } })
          .toArray();
        return { folderName: folder.folderName, tools };
      }) || []
    );

    user.bookmarks = bookmarkTools;

    res.render("profile", { user, sessionUser: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/add-tool", (req, res) => {
  if (!req.session.user) return res.redirect("/auth/login");
  res.render("addTool", { user: req.session.user });
});

router.get("/auth/login", (req, res) => {
  res.render("login");
});

router.get("/auth/register", (req, res) => {
  res.render("register");
});

export default router;
