require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const seedAdminUser = require("./config/seed");

const PORT = process.env.PORT || 5000;

connectDB().then(seedAdminUser);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});