const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/trelloFinal")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= MODELS =================

// User Model
const User = mongoose.model("User", {
  email: String,
  password: String,
});

// Task Model
const Task = mongoose.model("Task", {
  title: String,
  status: { type: String, default: "todo" },
  dueDate: String,
  description: String,
});

// ================= AUTH ROUTES =================

// Signup
app.post("/signup", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  res.json({ message: "User created successfully" });
});

// Login
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("User not found");

  const valid = await bcrypt.compare(req.body.password, user.password);

  if (!valid) return res.status(400).send("Wrong password");

  const token = jwt.sign({ id: user._id }, "secretkey");

  res.json({ token });
});

// ================= TASK ROUTES =================

// Get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Create task
app.post("/tasks", async (req, res) => {
  const newTask = new Task({
    title: req.body.title,
    status: "todo",
    dueDate: req.body.dueDate || "",
    description: req.body.description || "",
  });

  await newTask.save();
  res.json(newTask);
});

// Update task (drag-drop + edit)
app.put("/tasks/:id", async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedTask);
});

// Delete task
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.send("Task deleted");
});

// ================= SERVER =================

app.listen(5000, () => {
  console.log("Server running on port 5000");
});