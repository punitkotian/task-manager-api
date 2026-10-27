const mongoose = require("mongoose");
const { Schema } = mongoose;

const WorkspaceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
    },
  },
  { timestamps: true },
);

WorkspaceSchema.index({ inviteCode: 1 }, { unique: true });

module.exports = mongoose.model("Workspace", WorkspaceSchema);
