const mongoose = require("mongoose");

const SiteSettingsSchema = new mongoose.Schema(
  {
    header: {
      enabled: { type: Boolean, default: true },
      backgroundType: { type: String, default: "color" },
      backgroundColor: { type: String, default: "#3a3a3a" },
      backgroundImage: { type: String, default: "" },
      backgroundPositionX: { type: Number, default: 50 },
      backgroundPositionY: { type: Number, default: 50 },
      overlayOpacity: { type: Number, default: 0.35 },
      height: { type: Number, default: 120 },
      navigation: {
        offsetX: { type: Number, default: 0 },
        offsetY: { type: Number, default: 0 },
        color: { type: String, default: "#ffffff" },
        fontSize: { type: Number, default: 16 },
        submenu: {
          offsetX: { type: Number, default: 0 },
          offsetY: { type: Number, default: 0 },
          color: { type: String, default: "#ffffff" },
          fontSize: { type: Number, default: 16 },
          backgroundColor: { type: String, default: "#0a0a23" },
          transparentBackground: { type: Boolean, default: false },
          backgroundOpacity: { type: Number, default: 1 },
          borderEnabled: { type: Boolean, default: true },
          borderColor: { type: String, default: "#2a2a45" },
          borderWidth: { type: Number, default: 1 },
          borderRadius: { type: Number, default: 14 },
          minWidth: { type: Number, default: 200 },
        },
      },
      blocks: { type: Array, default: [] },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteSettings", SiteSettingsSchema);
