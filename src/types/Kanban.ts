export interface ApiResponse<T> {
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
    position: number

}


export interface BoardColumn {
    columnId: number;
    boardId: number;
    title: string;
    position: number;
    tasks: Task[];
}


export interface Board {
    id: number;
    name: string;
    BoardColumnsResponseList: BoardColumn[];

}