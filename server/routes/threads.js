import { Router } from "express";
import prisma from "../prisma/client.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

// -------------------------------------------------------------
//  GET /api/threads  — PUBLIC list (cursor pagination).
//  Reads stay public: do NOT guard this route.
// -------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const take = Number(req.query.take) || 10;
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;

    const threads = await prisma.thread.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "asc" },
      include: {
        author: { select: { name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    const nextCursor = threads[threads.length - 1]?.id ?? null;
    res.json({ threads, nextCursor });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
//  WRITE routes below.
//  RIGHT NOW THEY ARE UNPROTECTED — anyone can create, edit,
//  and delete threads. Your assignment is to guard these three
//  with the verifyToken middleware (GET above stays public).
// -------------------------------------------------------------

// POST /api/threads
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { title, body, authorId } = req.body ?? {};
    if (!title || !body) {
      return res.status(400).json({ error: "title and body are required" });
    }
    const thread = await prisma.thread.create({
      data: { title, body, authorId: authorId ?? null },
    });
    res.status(201).json(thread);
  } catch (error) {
    next(error);
  }
});

// PUT /api/threads/:id
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, body } = req.body ?? {};
    const thread = await prisma.thread.update({
      where: { id },
      data: { title, body },
    });
    res.json(thread);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/threads/:id
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.thread.delete({ where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
