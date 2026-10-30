const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) return;

  const exists = await User.findOne({ email });
  if (exists) return;

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashed, name, role: "ADMIN" });
  console.log(`Admin user created: ${email}`);
}

module.exports = seedAdminUser;
