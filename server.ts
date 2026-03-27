import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// Tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { logs: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  try {
    const task = await prisma.task.create({
      data: { title, description },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: Number(id) },
      data: { completed },
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// Activity Logs
app.get("/api/logs", async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { task: true },
      orderBy: { timestamp: "desc" },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.post("/api/logs", async (req, res) => {
  const { taskId, action, notes } = req.body;
  try {
    const log = await prisma.activityLog.create({
      data: { taskId: Number(taskId), action, notes },
    });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: "Failed to create log" });
  }
});

// --- VITE MIDDLEWARE ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Janani.ai Backend running on http://localhost:${PORT}`);
  });
}

startServer();
