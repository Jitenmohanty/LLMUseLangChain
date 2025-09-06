import app from "./app";
import { env } from "./config/env";

const port = Number(env.PORT || 8000);

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    // schedule jobs (idempotent if you run once)
    await import("./queues/schedule");
  } catch (e) {
    console.warn("Could not schedule jobs automatically:", e);
  }
});
