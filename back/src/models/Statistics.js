const mongoose = require("mongoose");

const StatisticsSchema = new mongoose.Schema(
  {
    totalViews: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    monthlyViews: [
      {
        month: { type: String }, // "Jan", "Feb", etc.
        views: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Statistics", StatisticsSchema);
