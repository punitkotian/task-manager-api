const mongoose = require("mongoose");
const { Roles } = require("../../../config/enums/roles");
const { Schema } = mongoose;

const MemberSchema = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: [Roles.OWNER, Roles.ADMIN, Roles.MEMBER],
      default: Roles.MEMBER,
    },
  },
  { timestamps: true },
);

MemberSchema.index(
  {
    workspace: 1,
    user: 1,
  },
  { unique: true },
);

module.exports = mongoose.model("Member", MemberSchema);
