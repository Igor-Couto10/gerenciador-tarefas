import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

export const tasksRouter = Router();

const VALID_STATUS = ["TODO", "DOING", "DONE"];

tasksRouter.use(authMiddleware);

// Listar as tarefas do usuário logado
tasksRouter.get("/", async (req: AuthRequest, res) => {
  const userId = req.userId as number;

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(tasks);
});

// Criar tarefa
tasksRouter.post("/", async (req: AuthRequest, res) => {
  const userId = req.userId as number;
  const { title, description } = req.body ?? {};

  if (!title || typeof title !== "string" || !title.trim()) {
    res.status(400).json({ error: "O título é obrigatório" });
    return;
  }

  const task = await prisma.task.create({
    data: { title: title.trim(), description, userId },
  });

  res.status(201).json(task);
});

// Editar tarefa
tasksRouter.put("/:id", async (req: AuthRequest, res) => {
  const userId = req.userId as number;
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const { title, description, status } = req.body ?? {};

  if (status !== undefined && !VALID_STATUS.includes(status)) {
    res.status(400).json({ error: "Status deve ser TODO, DOING ou DONE" });
    return;
  }

  const task = await prisma.task.findFirst({ where: { id, userId } });

  if (!task) {
    res.status(404).json({ error: "Tarefa não encontrada" });
    return;
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { title, description, status },
  });

  res.json(updated);
});

// Excluir tarefa
tasksRouter.delete("/:id", async (req: AuthRequest, res) => {
  const userId = req.userId as number;
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const task = await prisma.task.findFirst({ where: { id, userId } });

  if (!task) {
    res.status(404).json({ error: "Tarefa não encontrada" });
    return;
  }

  await prisma.task.delete({ where: { id } });

  res.status(204).send();
});