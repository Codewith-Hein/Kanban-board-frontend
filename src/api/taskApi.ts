import type {
  BaseResponse,
  CreateTaskRequest,
  Task,
  UpdateTaskRequest,
} from "../types/Kanban";
import { axiosClient } from "./axiosClient";

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  const response = await axiosClient.post<BaseResponse<Task>>("/tasks", data);
  return response.data.data;
};

export const getAllTask = async (): Promise<Task[]> => {
  const response = await axiosClient.get<BaseResponse<Task[]>>("/tasks");
  return response.data.data;
};

export const moveTask = async (id: number): Promise<Task> => {
  const response = await axiosClient.put<BaseResponse<Task>>(
    `/tasks/${id}/move`,
  );
  return response.data.data;
};

export const deleteTask = async (id: number): Promise<string> => {
  const response = await axiosClient.delete<string>(`/tasks/${id}`);
  return response.data;
};

export const updateTask = async (
  id: number,
  data: UpdateTaskRequest,
): Promise<Task> => {
  const response = await axiosClient.put<BaseResponse<Task>>(
    `/tasks/${id}`,
    data,
  );
  return response.data.data;
};

export const getTaskById = async (id: number): Promise<Task> => {
  const response = await axiosClient.get<BaseResponse<Task>>(`/tasks/${id}`);
  return response.data.data;
};
