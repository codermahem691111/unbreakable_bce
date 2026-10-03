const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

app.use(express.json());

// ===============================
// MONGODB SCHEMA
// ===============================

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Todo = mongoose.model("Todo", todoSchema);

// ===============================
// GET TODOS
// ===============================

app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({
      createdAt: -1,
    });

    res.status(200).json(todos);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch todos",
    });
  }
});

// ===============================
// CREATE TODO
// ===============================

app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Todo title is required",
      });
    }

    const todo = await Todo.create({
      title: title.trim(),
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create todo",
    });
  }
});

// ===============================
// UPDATE TODO
// ===============================

app.put("/api/todos/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;

    const updateData = {};

    // Update title if provided
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Todo title cannot be empty",
        });
      }

      updateData.title = title.trim();
    }

    // Update completed status if provided
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json(todo);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update todo",
    });
  }
});

// ===============================
// DELETE TODO
// ===============================

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(
      req.params.id
    );

    if (!todo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete todo",
    });
  }
});

// ===============================
// HEALTH CHECK
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Todo API is running 🚀",
  });
});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });