const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    commentId: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ to: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);