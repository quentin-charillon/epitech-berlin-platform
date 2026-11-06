require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.routes");
const pagesRoutes = require("./routes/pages.routes");
const statisticsRoutes = require("./routes/statistics.routes");
const siteSettingsRoutes = require("./routes/siteSettings.routes");
const usersRoutes = require("./routes/users.routes");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 5000;
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/*
 ROUTES API
*/
app.use("/api/auth", authRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/users", usersRoutes);

/*
 SWAGGER
*/
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Epitech Berlin API",
      version: "1.0.0",
      description: "API for Epitech Berlin campus website back office"
    },
    servers: [
      {
        url: `http://localhost:${PORT}`
      }
    ]
  },
  apis: [path.join(__dirname, "/routes/**/*.js")]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/*
 ROUTES TEST
*/
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime()
  });
});

// Lightweight readiness probe used by the frontend while a Render instance wakes up.
// It does not query MongoDB; readyState is maintained by the existing connection.
app.get("/api/health/ready", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;

  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ready" : "starting",
    database: databaseReady ? "connected" : "unavailable"
  });
});

module.exports = app;
