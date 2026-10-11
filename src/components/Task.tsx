import React from "react";
import type { Task } from "../types/Kanban";

const Task = ({ task }: { task: Task }) => {
  return (
    <div>
      <h1>{task.title}</h1>
      <h2>{task.description}</h2>
      <h3>{task.position}</h3>
    </div>
  );
};

export default Task;
