import type {
  BoardColumnType,
  CreateBoardColumnRequest,
  UpdateBoardColumnRequest,
  UpdateBoardColumnResponse,
} from "../types/Kanban";
import { axiosClient } from "./axiosClient";

export const createBoardColumn = async (
  data: CreateBoardColumnRequest,
): Promise<BoardColumnType> => {
  const response = await axiosClient.post("/board-columns", data);
  return response.data;
};

export const getColumnByBoardId = async (
  id: number,
): Promise<BoardColumnType[]> => {
  const response = await axiosClient.get(`/board-columns/${id}`);
  return response.data;
};

export const updateBoardColumn = async (
  id: number,
  data: UpdateBoardColumnRequest,
): Promise<UpdateBoardColumnResponse> => {
  const response = await axiosClient.put(`/board-columns/${id}`, data);
  return response.data;
};

export const deleteBoardColumn = async (id: number): Promise<void> => {
  const response = await axiosClient.delete(`/board-columns/${id}`);
  return response.data;
};
