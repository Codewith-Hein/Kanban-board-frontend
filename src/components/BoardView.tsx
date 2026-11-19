import { Button, Input, Layout, message, Modal, Spin, theme } from "antd";
import type React from "react";
import { useEffect, useState } from "react";
import {
  createBoardColumn,
  deleteBoardColumn,
  updateBoardColumn,
} from "../api/columnApi";
import type { BoardColumnType, BoardDetail, Task } from "../types/Kanban";
import BoardColumn from "./BoardColumn";
import { DragDropContext } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { moveTask } from "../api/taskApi"; // Don't forget to import your new API!

const { Content } = Layout;

interface BoardViewProps {
  currentBoard: BoardDetail | null;
  boardLoading: boolean;
}

const BoardView: React.FC<BoardViewProps> = ({
  currentBoard,
  boardLoading,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [columnNameInput, setColumnNameInput] = useState<string>("");
  const [columnList, setColumnList] = useState<BoardColumnType[]>([]);
  const [editColumn, setEditColumn] = useState<BoardColumnType | null>(null);

  const openModel = () => {
    setEditColumn(null);
    setIsModalOpen(true);
    setColumnNameInput("");
  };

  const showEditModel = (editColumn: BoardColumnType) => {
    setIsModalOpen(true);
    setEditColumn(editColumn);
    setColumnNameInput(editColumn?.title);
  };
  const handleTaskDeleted = (taskId: number) => {
    setColumnList((prev) =>
      prev.map((col) => ({
        ...col,
        // Keep all tasks EXCEPT the one we just deleted
        tasks: (col.tasks || []).filter((task) => task.taskId !== taskId),
      })),
    );
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBoardColumn(id);
      setColumnList((prev) => prev.filter((p) => p.columnId !== id));
      message.success("delete column successful");
    } catch (error) {
      message.error("fail to delete column");
      console.log(error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setColumnNameInput("");
    setEditColumn(null);
  };

  const handleTaskCreated = (newTask: Task) => {
    setColumnList((prev) =>
      prev.map((col) =>
        col.columnId === newTask.columnId
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col,
      ),
    );
  };

  const handleTaskUpdate = (updateTask: Task) => {
    setColumnList((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: (col.tasks || []).map((t) =>
          t.taskId === updateTask.taskId ? updateTask : t,
        ),
      })),
    );
  };

  const handleOk = async () => {
    if (!columnNameInput.trim() || !currentBoard) {
      message.warning("column name is required");
      return;
    }

    try {
      setLoading(true);

      if (editColumn) {
        const updated = await updateBoardColumn(editColumn.columnId, {
          title: columnNameInput.trim(),
          position: editColumn.position,
        });

        setColumnList((prev) =>
          prev.map((col) =>
            col.columnId === editColumn.columnId
              ? { ...col, title: updated.title, position: updated.position } // Keeps columnId & tasks, updates title!
              : col,
          ),
        );
        message.success("Column updated successfully");
      } else {
        const newColumn = await createBoardColumn({
          boardId: currentBoard?.id,
          title: columnNameInput.trim(),
          position: columnList.length + 1,
        });

        setColumnList((prev) => [...prev, newColumn]);
        message.success("Column created successfully");
      }

      setColumnNameInput("");
      setIsModalOpen(false);
      setEditColumn(null);
    } catch (error) {
      message.error(
        editColumn ? "fail to update column" : "fail to create column",
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentBoard && currentBoard.boardColumnResponseList) {
      setColumnList(currentBoard.boardColumnResponseList);
    } else {
      setColumnList([]);
    }
  }, [currentBoard]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 1. If dropped outside a valid column, do nothing
    if (!destination) return;

    // 2. If dropped in the exact same spot, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColId = Number(source.droppableId);
    const destColId = Number(destination.droppableId);
    const taskId = Number(draggableId);

    // 3. Clone the arrays so we can mutate them safely
    const newColumnList = [...columnList];
    const sourceColIndex = newColumnList.findIndex(
      (col) => col.columnId === sourceColId,
    );
    const destColIndex = newColumnList.findIndex(
      (col) => col.columnId === destColId,
    );

    const sourceTasks = [...(newColumnList[sourceColIndex].tasks || [])];
    const destTasks =
      sourceColId === destColId
        ? sourceTasks
        : [...(newColumnList[destColIndex].tasks || [])];

    // 4. Remove the task from its old position
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // 5. Insert the task into its new position
    destTasks.splice(destination.index, 0, movedTask);

    // 6. Update the React state instantly (Optimistic UI Update)
    newColumnList[sourceColIndex].tasks = sourceTasks;
    if (sourceColId !== destColId) {
      newColumnList[destColIndex].tasks = destTasks;
    }
    setColumnList(newColumnList);

    // 7. Tell Spring Boot about the move in the background
    try {
      await moveTask(taskId, {
        columnId: destColId,
        position: destination.index + 1,
      });
    } catch (error) {
      message.error("Failed to move task on the server.");
      console.log(error);
      // If you want to be extra safe, you could reload the board here if it fails!
    }
  };

  return (
    <>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          overflowX: "auto",
        }}
      >
        {boardLoading ? (
          <Spin />
        ) : currentBoard ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2>{currentBoard.name}</h2>
                <p>Board ID :{currentBoard.id}</p>
              </div>

              <Button type="primary" onClick={openModel}>
                + Create Column
              </Button>
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <BoardColumn
                columnList={columnList}
                editModel={showEditModel}
                handleDelete={handleDelete}
                onTaskCreated={handleTaskCreated}
                handleTaskDelete={handleTaskDeleted}
                handleTaskUpdate={handleTaskUpdate}
              />
            </DragDropContext>
          </div>
        ) : (
          <p>Please Select a board from Menu</p>
        )}
      </Content>
      <Modal
        title={editColumn ? "Edit Column" : "Create Column"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter Column Name"
          value={columnNameInput}
          onChange={(e) => setColumnNameInput(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default BoardView;
