import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import {
  Button,
  Empty,
  Input,
  Layout,
  message,
  Modal,
  Select,
  Spin,
  Tag,
} from "antd";
import type React from "react";
import { useMemo, useState } from "react";
import { getErrorMessage } from "../api/axiosClient";
import {
  createBoardColumn,
  deleteBoardColumn,
  updateBoardColumn,
} from "../api/columnApi";
import { moveTask } from "../api/taskApi";
import type {
  BoardColumnType,
  BoardDetail,
  Priority,
  Task,
} from "../types/Kanban";
import BoardColumn from "./BoardColumn";

const { Content } = Layout;

interface BoardViewProps {
  currentBoard: BoardDetail | null;
  boardLoading: boolean;
  onBoardColumnsChange: (
    updater: (prevCols: BoardColumnType[]) => BoardColumnType[],
  ) => void;
  onOpenCreateBoardModal: () => void;
}

function parsePrefixedId(raw: string, prefix: string): number {
  return Number(raw.startsWith(prefix) ? raw.slice(prefix.length) : raw);
}

function normalizeTaskPositions(tasks: Task[], columnId: number): Task[] {
  return tasks.map((task, idx) => ({
    ...task,
    columnId,
    position: idx + 1,
  }));
}

const BoardView: React.FC<BoardViewProps> = ({
  currentBoard,
  boardLoading,
  onBoardColumnsChange,
  onOpenCreateBoardModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [columnNameInput, setColumnNameInput] = useState<string>("");
  const [editColumn, setEditColumn] = useState<BoardColumnType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | Priority>("ALL");

  const columnList = useMemo(
    () => currentBoard?.boardColumnResponseList ?? [],
    [currentBoard],
  );

  const isFiltered =
    searchQuery.trim().length > 0 || priorityFilter !== "ALL";

  const displayedColumns = useMemo(() => {
    if (!isFiltered) return columnList;
    const q = searchQuery.trim().toLowerCase();
    return columnList.map((col) => ({
      ...col,
      tasks: (col.tasks || []).filter((task) => {
        const matchesPriority =
          priorityFilter === "ALL" || task.priority === priorityFilter;
        const matchesQuery =
          !q ||
          (task.title ?? "").toLowerCase().includes(q) ||
          (task.description ?? "").toLowerCase().includes(q);
        return matchesPriority && matchesQuery;
      }),
    }));
  }, [columnList, isFiltered, priorityFilter, searchQuery]);

  const totalTasks = useMemo(
    () =>
      columnList.reduce((sum, col) => sum + (col.tasks ? col.tasks.length : 0), 0),
    [columnList],
  );

  const openCreateColumnModal = () => {
    setEditColumn(null);
    setColumnNameInput("");
    setIsModalOpen(true);
  };

  const showEditModal = (column: BoardColumnType) => {
    setEditColumn(column);
    setColumnNameInput(column.title);
    setIsModalOpen(true);
  };

  const handleDeleteColumn = async (id: number) => {
    try {
      await deleteBoardColumn(id);
      onBoardColumnsChange((prev) =>
        prev
          .filter((col) => col.columnId !== id)
          .map((col, idx) => ({ ...col, position: idx + 1 })),
      );
      message.success("Column deleted successfully");
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to delete column"));
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setColumnNameInput("");
    setEditColumn(null);
  };

  const handleTaskCreated = (newTask: Task) => {
    onBoardColumnsChange((prev) =>
      prev.map((col) =>
        col.columnId === newTask.columnId
          ? { ...col, tasks: [...(col.tasks || []), newTask] }
          : col,
      ),
    );
  };

  const handleTaskDeleted = (taskId: number) => {
    onBoardColumnsChange((prev) =>
      prev.map((col) => {
        const filtered = (col.tasks || []).filter((t) => t.taskId !== taskId);
        return {
          ...col,
          tasks: normalizeTaskPositions(filtered, col.columnId),
        };
      }),
    );
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    onBoardColumnsChange((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: (col.tasks || []).map((t) =>
          t.taskId === updatedTask.taskId ? updatedTask : t,
        ),
      })),
    );
  };

  const handleOk = async () => {
    const trimmedTitle = columnNameInput.trim();
    if (!trimmedTitle || !currentBoard) {
      message.warning("Column name is required");
      return;
    }

    try {
      setLoading(true);

      if (editColumn) {
        const updated = await updateBoardColumn(editColumn.columnId, {
          title: trimmedTitle,
          position: editColumn.position,
        });

        onBoardColumnsChange((prev) =>
          prev.map((col) =>
            col.columnId === editColumn.columnId
              ? { ...col, title: updated.title, position: updated.position }
              : col,
          ),
        );
        message.success("Column updated successfully");
      } else {
        const newColumn = await createBoardColumn({
          boardId: currentBoard.id,
          title: trimmedTitle,
          position: columnList.length + 1,
        });

        onBoardColumnsChange((prev) => [...prev, newColumn]);
        message.success("Column created successfully");
      }

      setColumnNameInput("");
      setIsModalOpen(false);
      setEditColumn(null);
    } catch (error) {
      message.error(
        getErrorMessage(
          error,
          editColumn ? "Failed to update column" : "Failed to create column",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const previousColumns = columnList;

    if (type === "COLUMN") {
      const columnId = parsePrefixedId(draggableId, "col-");
      const nextColumns = [...columnList];
      const [movedColumn] = nextColumns.splice(source.index, 1);
      if (!movedColumn) return;

      nextColumns.splice(destination.index, 0, movedColumn);
      const normalizedColumns = nextColumns.map((col, idx) => ({
        ...col,
        position: idx + 1,
      }));

      onBoardColumnsChange(() => normalizedColumns);

      try {
        await updateBoardColumn(columnId, {
          title: movedColumn.title,
          position: destination.index + 1,
        });
      } catch (error) {
        onBoardColumnsChange(() => previousColumns);
        message.error(getErrorMessage(error, "Failed to reorder column"));
      }
      return;
    }

    const sourceColId = parsePrefixedId(source.droppableId, "col-tasks-");
    const destColId = parsePrefixedId(destination.droppableId, "col-tasks-");
    const taskId = parsePrefixedId(draggableId, "task-");

    const sourceCol = columnList.find((col) => col.columnId === sourceColId);
    const destCol = columnList.find((col) => col.columnId === destColId);
    if (!sourceCol || !destCol) return;

    const sourceTasks = [...(sourceCol.tasks || [])];
    const [movedTask] = sourceTasks.splice(source.index, 1);
    if (!movedTask) return;

    let nextColumns: BoardColumnType[];

    if (sourceColId === destColId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      const updatedTasks = normalizeTaskPositions(sourceTasks, sourceColId);
      nextColumns = columnList.map((col) =>
        col.columnId === sourceColId ? { ...col, tasks: updatedTasks } : col,
      );
    } else {
      const destTasks = [...(destCol.tasks || [])];
      destTasks.splice(destination.index, 0, {
        ...movedTask,
        columnId: destColId,
      });

      const updatedSourceTasks = normalizeTaskPositions(
        sourceTasks,
        sourceColId,
      );
      const updatedDestTasks = normalizeTaskPositions(destTasks, destColId);

      nextColumns = columnList.map((col) => {
        if (col.columnId === sourceColId) {
          return { ...col, tasks: updatedSourceTasks };
        }
        if (col.columnId === destColId) {
          return { ...col, tasks: updatedDestTasks };
        }
        return col;
      });
    }

    onBoardColumnsChange(() => nextColumns);

    try {
      await moveTask(taskId, {
        columnId: destColId,
        position: destination.index + 1,
      });
    } catch (error) {
      onBoardColumnsChange(() => previousColumns);
      message.error(getErrorMessage(error, "Failed to move task"));
    }
  };

  return (
    <>
      <Content
        style={{
          margin: 20,
          padding: 24,
          minHeight: 280,
          background: "#ffffff",
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          overflowX: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {boardLoading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 320,
            }}
          >
            <Spin size="large" />
          </div>
        ) : currentBoard ? (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
                borderBottom: "1px solid #efefef",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "#0a0a0a",
                    margin: 0,
                  }}
                >
                  {currentBoard.name}
                </h2>
                <p
                  style={{
                    color: "#737373",
                    fontSize: 13,
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  {columnList.length}{" "}
                  {columnList.length === 1 ? "column" : "columns"} ·{" "}
                  {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {columnList.length > 0 && (
                  <>
                    <Input
                      allowClear
                      prefix={<SearchOutlined style={{ color: "#737373" }} />}
                      placeholder="Filter tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: 200 }}
                    />
                    <Select<"ALL" | Priority>
                      value={priorityFilter}
                      onChange={(val) => setPriorityFilter(val)}
                      style={{ width: 145 }}
                      options={[
                        { value: "ALL", label: "All Priorities" },
                        { value: "HIGH", label: "High Priority" },
                        { value: "MEDIUM", label: "Medium Priority" },
                        { value: "LOW", label: "Low Priority" },
                      ]}
                    />
                  </>
                )}

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateColumnModal}
                >
                  Create Column
                </Button>
              </div>
            </div>

            {isFiltered && (
              <div style={{ marginTop: 12 }}>
                <Tag
                  style={{
                    background: "#f5f5f5",
                    color: "#0a0a0a",
                    borderColor: "#d4d4d4",
                  }}
                >
                  Drag-and-drop reordering is paused while filters are active
                </Tag>
              </div>
            )}

            {columnList.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 320,
                }}
              >
                <Empty
                  description={
                    <span style={{ color: "#525252" }}>
                      No columns yet. Add a column to start organizing tasks.
                    </span>
                  }
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateColumnModal}
                  >
                    Create First Column
                  </Button>
                </Empty>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <BoardColumn
                  columnList={displayedColumns}
                  isDragDisabled={isFiltered}
                  editModal={showEditModal}
                  handleDelete={handleDeleteColumn}
                  onTaskCreated={handleTaskCreated}
                  handleTaskDelete={handleTaskDeleted}
                  handleTaskUpdate={handleTaskUpdated}
                />
              </DragDropContext>
            )}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 320,
            }}
          >
            <Empty
              description={
                <span style={{ color: "#525252" }}>
                  Select a board from the sidebar or create a new one.
                </span>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onOpenCreateBoardModal}
              >
                Create Board
              </Button>
            </Empty>
          </div>
        )}
      </Content>

      <Modal
        title={editColumn ? "Edit Column" : "Create Column"}
        closable={{ "aria-label": "Close" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText={editColumn ? "Save Changes" : "Create Column"}
      >
        <Input
          autoFocus
          placeholder="Enter column name"
          value={columnNameInput}
          onChange={(e) => setColumnNameInput(e.target.value)}
          onPressEnter={handleOk}
        />
      </Modal>
    </>
  );
};

export default BoardView;
