const Research = require("../models/Research");

const getAllResearch = async (req, res) => {
  try {
    const items = await Research.find().sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching research", error: error.message });
  }
};

const getResearchById = async (req, res) => {
  try {
    const item = await Research.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Research not found" });
    res.status(200).json(item);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching research", error: error.message });
  }
};

const createResearch = async (req, res) => {
  try {
    const { userId, title, content, category, tags, source } = req.body;
    if (!title || !content)
      return res
        .status(400)
        .json({ message: "Title and content are required" });

    const item = new Research({
      userId: userId || "default-user",
      title: title.trim(),
      content: content.trim(),
      category: category?.trim() || "General",
      tags: Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : [],
      source: source?.trim() || "",
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating research", error: error.message });
  }
};

const updateResearch = async (req, res) => {
  try {
    const item = await Research.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Research not found" });

    const fields = [
      "title",
      "content",
      "category",
      "tags",
      "source",
      "isFavorite",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    const updated = await item.save();
    res.status(200).json(updated);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating research", error: error.message });
  }
};

const deleteResearch = async (req, res) => {
  try {
    const item = await Research.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Research not found" });
    await item.deleteOne();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting research", error: error.message });
  }
};

module.exports = {
  getAllResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
};
