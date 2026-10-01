import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 2000 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, default: null },
    image: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    isAvailable: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ItemSchema.index({ category: 1, order: 1 });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
