import "dotenv/config";
import express from "express";
import cors from "cors";
import threadsRouter from "./routes/threads.js";
import authRouter from "./routes/auth.js";
import prisma from "./prisma/client.js";
import verifyToken from "./middleware/verifyToken.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);          // provided scaffold — issues tokens
app.use("/api/threads", threadsRouter);

// -------------------------------------------------------------
//  TODO (assignment): add a protected route here
//      GET /api/me  ->  returns req.user
//  Apply your verifyToken middleware to it.
// -------------------------------------------------------------
app.get("/api/me", verifyToken, (req, res) => {
  res.json(req.user);
});

// Global error handler (4 arguments).
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
});

const PORT = 3001;

async function start() {
  await prisma.$connect();
  console.log("✅ Prisma connected");
  app.listen(PORT, () => {
    console.log(`✅ Threadbase API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start");
  console.error(err);
  process.exit(1);
});
