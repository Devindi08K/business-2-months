import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 255 },
    phone: { type: String, required: true, maxlength: 30 },
    date: { type: String, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true, min: 1, max: 50 },
    service: { type: String, default: "", maxlength: 200 },
    notes: { type: String, default: "", maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

BookingSchema.index({ status: 1, date: 1 });

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
