const express = require("express");
const router = express.Router();
const Statistics = require("../models/Statistics");

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Dashboard statistics data
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get statistics data
 *     tags: [Statistics]
 *     description: Returns dashboard statistics (total views, unique users, monthly views)
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalViews:
 *                   type: number
 *                   example: 5420
 *                 uniqueUsers:
 *                   type: number
 *                   example: 342
 *                 monthlyViews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "Jan"
 *                       views:
 *                         type: number
 *                         example: 450
 */
router.get("/", async (req, res) => {
  try {
    let statistics = await Statistics.findOne().lean();

    // Si aucune donnée, créer des données par défaut
    if (!statistics) {
      const defaultStatistics = new Statistics({
        totalViews: 5420,
        uniqueUsers: 342,
        monthlyViews: [
          { month: "Jan", views: 450 },
          { month: "Feb", views: 523 },
          { month: "Mar", views: 489 },
          { month: "Apr", views: 612 },
          { month: "May", views: 745 },
          { month: "Jun", views: 920 },
          { month: "Jul", views: 681 },
        ],
      });

      statistics = await defaultStatistics.save();
    }

    res.json(statistics);
  } catch (err) {
    console.error("GET /api/statistics error", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

/**
 * @swagger
 * /api/statistics:
 *   put:
 *     summary: Update statistics data
 *     tags: [Statistics]
 *     description: Update dashboard statistics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalViews:
 *                 type: number
 *               uniqueUsers:
 *                 type: number
 *               monthlyViews:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Statistics updated
 */
router.put("/", async (req, res) => {
  try {
    const { totalViews, uniqueUsers, monthlyViews } = req.body;

    let statistics = await Statistics.findOne();

    if (!statistics) {
      statistics = new Statistics({
        totalViews: totalViews || 0,
        uniqueUsers: uniqueUsers || 0,
        monthlyViews: monthlyViews || [],
      });
    } else {
      if (totalViews !== undefined) statistics.totalViews = totalViews;
      if (uniqueUsers !== undefined) statistics.uniqueUsers = uniqueUsers;
      if (monthlyViews !== undefined) statistics.monthlyViews = monthlyViews;
    }

    const updated = await statistics.save();
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/statistics error", err);
    res.status(500).json({ error: "Failed to update statistics" });
  }
});

module.exports = router;
