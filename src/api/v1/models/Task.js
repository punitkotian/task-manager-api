const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      requried: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
    links: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      lowercase: true,
      default: [],
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: [
          "backlog",
          "todo",
          "in-progress",
          "review",
          "completed",
          "archived",
        ],
      },
      default: "backlog",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    completionProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
