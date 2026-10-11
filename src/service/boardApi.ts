import { type ApiResponse, type Board } from "../types/Kanban";
import { api } from "./api";


export const getBoardByid = async (id: number): Promise<Board> => {

    const ApiResponse = await api.get<ApiResponse<Board>>(`/board/${id}`);

    const data = ApiResponse.data.data

    return data

}