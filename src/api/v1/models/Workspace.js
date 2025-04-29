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
  { timeStamp: true }
);

module.exports = mongoose.model("Workspace", WorkspaceSchema);
