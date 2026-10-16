export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface BaseResponse<T> {
  status: number;
  message: string;
  data: T;
  errors: Record<string, string> | null;
}

export interface Task {
  taskId: number;
  columnId: number;
  title: string | null;
  description: string | null;
  position: number;
  priority: Priority;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  position: number;
  columnId: number;
  priority: Priority;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  position: number;
  priority: Priority;
}

export interface MoveTaskRequest {
  columnId: number;
}

export interface BoardColumn {
  columnId: number;
  boardId: number;
  title: string;
  position: number;
  tasks: Task[];
}

export interface CreateBoardColumnRequest {
  boardId: number;
  title: string;
  position: number;
}

export interface UpdateBoardColumnRequest {
  title: string;
  position: number;
}

export interface UpdateBoardColumnResponse {
  title: string;
  position: number;
}

export interface BoardSummary {
  id: number;
  name: string;
}

export interface BoardDetail {
  id: number;
  name: string;
  boardColumnResponseList: BoardColumn[];
}

export interface BoardRequest {
  name: string;
}
