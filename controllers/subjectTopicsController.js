const SubjectTopics = require("../models/SubjectTopics");

const getSubjects = async (req, res) => {
  try {
    const subjects = await SubjectTopics.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(subjects);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const createSubject = async (req, res) => {
  try {
    const { userId, name, color } = req.body;
    const subject = new SubjectTopics({ userId, name, color, sections: [] });
    res.status(201).json(await subject.save());
  } catch (e) { res.status(400).json({ message: e.message }); }
};

const deleteSubject = async (req, res) => {
  try {
    await SubjectTopics.findByIdAndDelete(req.params.id);
    res.json({ message: "Subject deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

const updateSubjectColor = async (req, res) => {
  try {
    const subject = await SubjectTopics.findByIdAndUpdate(
      req.params.id,
      { color: req.body.color },
      { new: true }
    );
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (e) { res.status(400).json({ message: e.message }); }
};

// ── Sections ──────────────────────────────────────────
const addSection = async (req, res) => {
  try {
    const subject = await SubjectTopics.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    subject.sections.push({ name: req.body.name, topics: [] });
    res.json(await subject.save());
  } catch (e) { res.status(400).json({ message: e.message }); }
};

const deleteSection = async (req, res) => {
  try {
    const subject = await SubjectTopics.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    subject.sections = subject.sections.filter(s => s._id.toString() !== req.params.sectionId);
    res.json(await subject.save());
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// ── Topics inside a section ────────────────────────────
const addTopic = async (req, res) => {
  try {
    const subject = await SubjectTopics.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    const section = subject.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    section.topics.push({ name: req.body.name, notes: req.body.notes || "" });
    res.json(await subject.save());
  } catch (e) { res.status(400).json({ message: e.message }); }
};

const deleteTopic = async (req, res) => {
  try {
    const subject = await SubjectTopics.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    const section = subject.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });
    section.topics = section.topics.filter(t => t._id.toString() !== req.params.topicId);
    res.json(await subject.save());
  } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = { getSubjects, createSubject, deleteSubject, updateSubjectColor, addSection, deleteSection, addTopic, deleteTopic };
