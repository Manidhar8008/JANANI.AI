export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  taskId: number;
  action: string;
  timestamp: string;
  notes: string | null;
  task: { title: string };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
