import type { BoardDetail, BoardRequest, BoardSummary } from "../types/Kanban";
import { axiosClient } from "./axiosClient";

export const getAllBoards = async (): Promise<BoardSummary[]> => {
  const response = await axiosClient.get("/board");
  return response.data;
};

export const createBoard = async (
  data: BoardRequest,
): Promise<BoardSummary> => {
  const response = await axiosClient.post("/board", data);
  return response.data;
};

export const getByBoardId = async (id: number): Promise<BoardDetail> => {
  const response = await axiosClient.get(`/board/${id}`);
  return response.data;
};

export const updateBoard = async (
  id: number,
  data: BoardRequest,
): Promise<BoardSummary> => {
  const response = await axiosClient.put(`/board/${id}`, data);
  return response.data;
};

export const deleteBoard = async (id: number): Promise<void> => {
  const respone = await axiosClient.delete(`/board/${id}`);
  return respone.data;
};
