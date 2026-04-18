const app = require("./app");
const { port } = require("./config");
const { initDatabase } = require("./db/postgres");

async function start() {
  await initDatabase();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`ordering-service listening on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start ordering-service", err);
  process.exit(1);
});
