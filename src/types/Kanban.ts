export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type DueFilter =
  | "ALL"
  | "OVERDUE"
  | "TODAY"
  | "THIS_WEEK"
  | "NO_DUE_DATE";

export interface BaseResponse<T> {
  status: number;
  message: string;
  data: T;
  errors: Record<string, string> | null;
}

export type ApiErrorResponse = BaseResponse<null>;

export interface Task {
  taskId: number;
  columnId: number;
  title: string | null;
  description: string | null;
  position: number;
  priority: Priority;
  dueDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  position?: number;
  columnId: number;
  priority: Priority;
  dueDate?: string | null;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  position: number;
  priority: Priority;
  dueDate?: string | null;
}

export interface MoveTaskRequest {
  columnId: number;
  position: number;
}

export interface BoardColumnType {
  columnId: number;
  boardId: number;
  title: string;
  position: number;
  completed: boolean;
  tasks: Task[];
}

export interface CreateBoardColumnRequest {
  boardId: number;
  title: string;
  position: number;
  completed?: boolean;
}

export interface UpdateBoardColumnRequest {
  title: string;
  position: number;
  completed?: boolean;
}

export interface UpdateBoardColumnResponse {
  columnId?: number;
  boardId?: number;
  title: string;
  position: number;
  completed: boolean;
}

export interface BoardSummary {
  id: number;
  name: string;
}

export interface BoardDetail {
  id: number;
  name: string;
  boardColumnResponseList: BoardColumnType[];
}

export interface BoardRequest {
  name: string;
}
