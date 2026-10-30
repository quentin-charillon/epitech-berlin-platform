const express = require("express");
const router = express.Router();
const Page = require("../models/Page");
const { verifyToken, requireAdmin } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Pages management
 */

/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: Get all pages
 *     tags: [Pages]
 *     responses:
 *       200:
 *         description: List of pages
 */
router.get("/", async (req, res) => {
  try {
    const pages = await Page.find()
      .select("-blocks")
      .sort({ navOrder: 1, title: 1 })
      .lean();

    res.json(pages);
  } catch (err) {
    console.error("GET /api/pages error", err);
    res.status(500).json({ error: "Failed to load pages" });
  }
});

/**
 * @swagger
 * /api/pages:
 *   post:
 *     summary: Create a new page
 *     tags: [Pages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - title
 *             properties:
 *               slug:
 *                 type: string
 *                 example: home/about
 *               title:
 *                 type: string
 *                 example: About page
 *               navLabel:
 *                 type: string
 *                 example: About
 *               parentSlug:
 *                 type: string
 *                 nullable: true
 *                 example: home
 *               showInNav:
 *                 type: boolean
 *                 example: true
 *               navOrder:
 *                 type: number
 *                 example: 10
 *               backgroundColor:
 *                 type: string
 *                 example: transparent
 *               blocks:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Page created
 */
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.slug || !payload.title) {
      return res.status(400).json({
        error: "slug and title are required",
      });
    }

    const page = await Page.findOneAndUpdate(
      { slug: payload.slug },
      payload,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(201).json(page);
  } catch (err) {
    console.error("POST /api/pages error", err);
    res.status(500).json({ error: "Failed to create page" });
  }
});

/**
 * @swagger
 * /api/pages/bulk:
 *   put:
 *     summary: Bulk save pages
 *     tags: [Pages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       200:
 *         description: Pages saved
 */
router.put("/bulk", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pages = Array.isArray(req.body) ? req.body : [];

    if (!pages.length) {
      return res.status(400).json({
        error: "Payload must be an array",
      });
    }

    const ops = pages
      .map((page) => {
        if (!page.slug) return null;

        return {
          updateOne: {
            filter: { slug: page.slug },
            update: { $set: page },
            upsert: true,
          },
        };
      })
      .filter(Boolean);

    await Page.bulkWrite(ops);

    const allPages = await Page.find()
      .select("-blocks")
      .sort({ navOrder: 1, title: 1 })
      .lean();

    res.json(allPages);
  } catch (err) {
    console.error("PUT /api/pages/bulk error", err);
    res.status(500).json({ error: "Failed to save pages" });
  }
});

/**
 * @swagger
 * /api/pages/{slug}:
 *   get:
 *     summary: Get one page by slug
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug, can be nested like home/g or home/g/test
 *     responses:
 *       200:
 *         description: Page found
 *       404:
 *         description: Page not found
 */
router.get(/^\/(.+)$/, async (req, res) => {
  try {
    const slug = req.params[0];

    const page = await Page.findOne({ slug }).lean();

    if (!page) {
      return res.status(404).json({
        error: "Page not found",
      });
    }

    res.json(page);
  } catch (err) {
    console.error("GET page error", err);
    res.status(500).json({ error: "Failed to load page" });
  }
});

/**
 * @swagger
 * /api/pages/{slug}:
 *   put:
 *     summary: Update one page by slug
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug, can be nested like home/g or home/g/test
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Page updated
 *       404:
 *         description: Page not found
 */
router.put(/^\/(.+)$/, verifyToken, requireAdmin, async (req, res) => {
  try {
    const slug = req.params[0];

    const page = await Page.findOneAndUpdate(
      { slug },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!page) {
      return res.status(404).json({
        error: "Page not found",
      });
    }

    res.json(page);
  } catch (err) {
    console.error("PUT page error", err);
    res.status(500).json({ error: "Failed to update page" });
  }
});

/**
 * @swagger
 * /api/pages/{slug}:
 *   delete:
 *     summary: Delete one page by slug
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Page slug, can be nested like home/g or home/g/test
 *     responses:
 *       200:
 *         description: Page deleted
 *       404:
 *         description: Page not found
 */
router.delete(/^\/(.+)$/, verifyToken, requireAdmin, async (req, res) => {
  try {
    const slug = req.params[0];

    const page = await Page.findOneAndDelete({ slug });

    if (!page) {
      return res.status(404).json({
        error: "Page not found",
      });
    }

    const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    await Page.deleteMany({
      $or: [
        { parentSlug: slug },
        { slug: new RegExp(`^${escapedSlug}/`) },
      ],
    });

    res.json({
      message: "Page deleted",
    });
  } catch (err) {
    console.error("DELETE page error", err);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

module.exports = router;