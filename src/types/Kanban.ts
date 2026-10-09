export interface Task {
    taskId: number;
    columnId: number;
    title: string;
    description: string;
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
    BoardColumns: BoardColumn[];

}