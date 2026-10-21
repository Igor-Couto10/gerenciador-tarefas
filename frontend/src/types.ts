export type User = {
  id: number;
  name: string;
  email: string;
};

export type TaskStatus = "TODO" | "DOING" | "DONE";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  userId: number;
};