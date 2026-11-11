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
            <BoardColumn
              columnList={columnList}
              editModel={showEditModel}
              handleDelete={handleDelete}
              onTaskCreated={handleTaskCreated}
              handleTaskDelete={handleTaskDeleted}
            />
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
