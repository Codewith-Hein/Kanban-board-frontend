import { type Board } from "../types/Kanban";
import { api } from "./api";


export const getBoardByid = async (id: number): Promise<Board> => {

    const ApiResponse = await api.get<Board>(`/board/${id}`);


    return ApiResponse.data

}