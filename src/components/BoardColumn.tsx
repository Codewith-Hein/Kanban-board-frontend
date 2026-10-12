import type { Column } from "../types/Kanban";
import Task from "./Task";

const BoardColumn = ({ column }: { column: Column }) => {
  return (
    <div>
      <h1>{column.title}</h1>
      <h2>{column.position}</h2>
      {column.tasks.map((task) => (
        <Task key={task.taskId} task={task} />
      ))}
    </div>
  );
};

export default BoardColumn;
