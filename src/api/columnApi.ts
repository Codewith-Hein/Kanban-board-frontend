import type {
  BaseResponse,
  BoardColumnType,
  CreateBoardColumnRequest,
  UpdateBoardColumnRequest,
  UpdateBoardColumnResponse,
} from "../types/Kanban";
import { axiosClient } from "./axiosClient";

export const createBoardColumn = async (
  data: CreateBoardColumnRequest,
): Promise<BoardColumnType> => {
  const response = await axiosClient.post<BaseResponse<BoardColumnType>>(
    "/board-columns",
    data,
  );
  return response.data.data;
};

export const getColumnByBoardId = async (
  id: number,
): Promise<BoardColumnType[]> => {
  const response = await axiosClient.get<BaseResponse<BoardColumnType[]>>(
    `/board-columns/board/${id}`,
  );
  return response.data.data;
};

export const updateBoardColumn = async (
  id: number,
  data: UpdateBoardColumnRequest,
): Promise<UpdateBoardColumnResponse> => {
  const response = await axiosClient.put<
    BaseResponse<UpdateBoardColumnResponse>
  >(`/board-columns/${id}`, data);
  return response.data.data;
};

export const deleteBoardColumn = async (id: number): Promise<void> => {
  await axiosClient.delete<BaseResponse<void>>(`/board-columns/${id}`);
};
