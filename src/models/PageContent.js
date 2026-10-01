import mongoose from "mongoose";

const PageContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, maxlength: 50 },
    locale: { type: String, default: "en", maxlength: 5 },
    sections: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PageContentSchema.index({ key: 1, locale: 1 }, { unique: true });

export default mongoose.models.PageContent ||
  mongoose.model("PageContent", PageContentSchema);
