import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 255 },
    phone: { type: String, default: "", maxlength: 30 },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MessageSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
