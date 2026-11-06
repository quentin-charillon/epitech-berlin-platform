const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");

test("GET /api/health/ready is registered on the production Express app", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/health/ready`);
  const body = await response.json();

  // No database is connected in this isolated test, so readiness must be 503,
  // proving both that the route exists and that it does not report a false ready.
  assert.equal(response.status, 503);
  assert.deepEqual(body, {
    status: "starting",
    database: "unavailable"
  });
});
