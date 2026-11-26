import type {
  BaseResponse,
  BoardDetail,
  BoardRequest,
  BoardSummary,
} from "../types/Kanban";
import { axiosClient } from "./axiosClient";

export const getAllBoards = async (): Promise<BoardSummary[]> => {
  const response =
    await axiosClient.get<BaseResponse<BoardSummary[]>>("/board");
  return response.data.data;
};

export const createBoard = async (
  data: BoardRequest,
): Promise<BoardSummary> => {
  const response = await axiosClient.post<BaseResponse<BoardSummary>>(
    "/board",
    data,
  );
  return response.data.data;
};

export const getByBoardId = async (id: number): Promise<BoardDetail> => {
  const response = await axiosClient.get<BaseResponse<BoardDetail>>(
    `/board/${id}`,
  );
  return response.data.data;
};

export const updateBoard = async (
  id: number,
  data: BoardRequest,
): Promise<BoardSummary> => {
  const response = await axiosClient.put<BaseResponse<BoardSummary>>(
    `/board/${id}`,
    data,
  );
  return response.data.data;
};

export const deleteBoard = async (id: number): Promise<void> => {
  await axiosClient.delete<BaseResponse<void>>(`/board/${id}`);
};
