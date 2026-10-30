const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    showInNav: { type: Boolean, default: true },
    navLabel: { type: String, trim: true },
    navOrder: { type: Number, default: 100 },
    parentSlug: { type: String, default: null, trim: true, lowercase: true },
    backgroundType: { type: String, default: "transparent" },
    backgroundColor: { type: String, default: "transparent" },
    backgroundGradient: {
      type: String,
      default: "linear-gradient(135deg, #2a2424 0%, #433a68 100%)",
    },
    backgroundGradientStart: { type: String, default: "#2a2424" },
    backgroundGradientEnd: { type: String, default: "#433a68" },
    backgroundGradientAngle: { type: Number, default: 135 },
    overlayEnabled: { type: Boolean, default: false },
    overlayColor: { type: String, default: "#000000" },
    overlayOpacity: { type: Number, default: 0.25 },
    footerEnabled: { type: Boolean, default: true },
    bottomPadding: { type: Number, default: 0 },
    backgroundImage: { type: String, default: "" },
    backgroundPositionX: { type: Number, default: 50 },
    backgroundPositionY: { type: Number, default: 50 },
    height: { type: Number, default: 160 },
    blocks: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Page", PageSchema);
