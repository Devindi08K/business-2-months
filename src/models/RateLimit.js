import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  windowStart: { type: Date, default: Date.now },
});

RateLimitSchema.index({ windowStart: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.RateLimit ||
  mongoose.model("RateLimit", RateLimitSchema);
