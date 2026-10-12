import type { Board } from "../types/Kanban";
import BoardColumn from "./BoardColumn";

const KanbanBoard = ({ board }: { board: Board }) => {
  return (
    <div>
      <h1>{board.name}</h1>
      {board.boardColumnResponseList.map((column) => (
        <BoardColumn key={column.columnId} column={column} />
      ))}
    </div>
  );
};

export default KanbanBoard;
