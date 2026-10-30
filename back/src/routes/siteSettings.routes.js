const express = require("express");
const router = express.Router();
const SiteSettings = require("../models/SiteSettings");
const { verifyToken, requireAdmin } = require("../middleware/auth");

/**
 * GET /api/site-settings
 */
router.get("/", async (req, res) => {
  try {
    let settings = await SiteSettings.findOne().lean();

    if (!settings) {
      const created = await SiteSettings.create({
        header: {
          enabled: true,
          backgroundType: "color",
          backgroundColor: "#3a3a3a",
          backgroundImage: "",
          backgroundPositionX: 50,
          backgroundPositionY: 50,
          overlayOpacity: 0.35,
          height: 120,
          blocks: [],
        },
      });

      settings = created.toObject();
    }

    res.json(settings);
  } catch (err) {
    console.error("GET /api/site-settings error", err);
    res.status(500).json({ error: "Failed to load site settings" });
  }
});

/**
 * PUT /api/site-settings
 */
router.put("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = new SiteSettings({
        header: payload.header || {
          enabled: true,
          backgroundType: "color",
          backgroundColor: "#3a3a3a",
          backgroundImage: "",
          backgroundPositionX: 50,
          backgroundPositionY: 50,
          overlayOpacity: 0.35,
          height: 120,
          blocks: [],
        },
      });
    } else if (payload.header) {
      const currentHeader =
        typeof settings.header?.toObject === "function"
          ? settings.header.toObject()
          : settings.header || {};

      settings.header = {
        ...currentHeader,
        ...payload.header,
      };
      settings.markModified("header");
    }

    const saved = await settings.save();
    res.json(saved);
  } catch (err) {
    console.error("PUT /api/site-settings error", err);
    res.status(500).json({ error: "Failed to save site settings" });
  }
});

module.exports = router;