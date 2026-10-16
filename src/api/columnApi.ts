import type {
  BoardColumn,
  CreateBoardColumnRequest,
  UpdateBoardColumnRequest,
  UpdateBoardColumnResponse,
} from "../types/Kanban";
import { axiosClient } from "./axiosClient";

export const createBoardColumn = async (
  data: CreateBoardColumnRequest,
): Promise<BoardColumn> => {
  const response = await axiosClient.post("/board-column", data);
  return response.data;
};

export const getColumnByBoardId = async (
  id: number,
): Promise<BoardColumn[]> => {
  const response = await axiosClient.get(`/board-column/${id}`);
  return response.data;
};

export const updateBoardColumn = async (
  id: number,
  data: UpdateBoardColumnRequest,
): Promise<UpdateBoardColumnResponse> => {
  const response = await axiosClient.put(`/board-column/${id}`, data);
  return response.data;
};

export const deleteBoardColumn = async (id: number): Promise<void> => {
  const response = await axiosClient.delete(`/board-column/${id}`);
  return response.data;
};
