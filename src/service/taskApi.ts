import type { ApiResponse, Task } from "../types/Kanban"
import { api } from "./api"

export interface TaskRequestDTO{
    title:string,
    description:string,
    position:number
    columnId:number
}


export const createTask=async(task:TaskRequestDTO)=>{

    const response=await api.post<ApiResponse<Task>>("/tasks",task)

    return response.data.data
}