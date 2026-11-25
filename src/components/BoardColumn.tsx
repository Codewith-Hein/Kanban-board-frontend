import {
  ExclamationCircleFilled,
  HolderOutlined,
  MoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Button, Dropdown, Input, message, Modal, Select } from "antd";
import React, { useState } from "react";
import { getErrorMessage } from "../api/axiosClient";
import { createTask, deleteTask, updateTask } from "../api/taskApi";
import type { BoardColumnType, Priority, Task } from "../types/Kanban";

const { TextArea } = Input;

interface BoardColumnProps {
  columnList: BoardColumnType[];
  isDragDisabled?: boolean;
  editModal: (column: BoardColumnType) => void;
  handleDelete: (id: number) => void;
  onTaskCreated: (newTask: Task) => void;
  handleTaskDelete: (id: number) => void;
  handleTaskUpdate: (updateTask: Task) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  columnList,
  isDragDisabled = false,
  editModal,
  handleDelete,
  onTaskCreated,
  handleTaskDelete,
  handleTaskUpdate,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  const [priority, setPriority] = useState<Priority>("LOW");
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      message.success("Task deleted successfully");
      handleTaskDelete(id);
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to delete task"));
    }
  };

  const handleTaskEdit = async (taskToEdit: Task) => {
    const updated = await updateTask(taskToEdit.taskId, {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      position: taskToEdit.position,
      priority,
    });

    handleTaskUpdate(updated);
    message.success("Task updated successfully");
  };

  const handleTaskCreate = async () => {
    const newTask = await createTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      columnId: selectedColumnId as number,
      priority,
    });

    onTaskCreated(newTask);
    message.success("Task created successfully");
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
    setPriority("LOW");
    setEditTask(null);
    setSelectedColumnId(null);
  };

  const handleOk = async () => {
    if (!taskTitle.trim() || selectedColumnId === null) {
      message.warning("Task title is required");
      return;
    }

    setLoading(true);
    try {
      if (editTask) {
        await handleTaskEdit(editTask);
      } else {
        await handleTaskCreate();
      }
      resetModal();
    } catch (error) {
      message.error(
        getErrorMessage(
          error,
          editTask ? "Failed to update task" : "Failed to create task",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (oldTask: Task, columnId: number) => {
    setIsModalOpen(true);
    setEditTask(oldTask);
    setTaskTitle(oldTask.title ?? "");
    setTaskDesc(oldTask.description ?? "");
    setPriority(oldTask.priority);
    setSelectedColumnId(columnId);
  };

  const onOpenCreateTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setIsModalOpen(true);
    setEditTask(null);
    setTaskTitle("");
    setTaskDesc("");
    setPriority("LOW");
  };

  return (
    <>
      <Droppable droppableId="board" direction="horizontal" type="COLUMN">
        {(boardProvided) => (
          <div
            ref={boardProvided.innerRef}
            {...boardProvided.droppableProps}
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 16,
              marginTop: 18,
              alignItems: "flex-start",
              flex: 1,
            }}
          >
            {columnList.map((column, colIndex) => {
              const tasks = column.tasks || [];
              return (
                <Draggable
                  key={column.columnId}
                  draggableId={`col-${column.columnId}`}
                  index={colIndex}
                  isDragDisabled={isDragDisabled}
                >
                  {(colProvided, colSnapshot) => (
                    <div
                      ref={colProvided.innerRef}
                      {...colProvided.draggableProps}
                      className={`kanban-column${
                        colSnapshot.isDragging ? " kanban-column--dragging" : ""
                      }`}
                    >
                      {/* Column Header (Drag Handle) */}
                      <div
                        {...colProvided.dragHandleProps}
                        style={{
                          padding: "14px 14px 10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          cursor: isDragDisabled ? "default" : "grab",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {!isDragDisabled && (
                            <HolderOutlined
                              style={{ color: "#737373", fontSize: 13 }}
                            />
                          )}
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: "#0a0a0a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {column.title}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 7px",
                              borderRadius: 999,
                              background: "#0a0a0a",
                              color: "#ffffff",
                              lineHeight: 1.4,
                              flexShrink: 0,
                            }}
                          >
                            {tasks.length}
                          </span>
                        </div>

                        <Dropdown
                          trigger={["click"]}
                          menu={{
                            items: [
                              { key: "edit", label: "Edit" },
                              { key: "delete", label: "Delete", danger: true },
                            ],
                            onClick: (info) => {
                              info.domEvent.stopPropagation();
                              if (info.key === "edit") {
                                editModal(column);
                              } else if (info.key === "delete") {
                                Modal.confirm({
                                  title: "Delete Column",
                                  icon: (
                                    <ExclamationCircleFilled
                                      style={{ color: "#0a0a0a" }}
                                    />
                                  ),
                                  content: `Are you sure you want to delete "${column.title}"?`,
                                  okText: "Yes, Delete",
                                  okType: "danger",
                                  cancelText: "Cancel",
                                  onOk: () => handleDelete(column.columnId),
                                });
                              }
                            },
                          }}
                        >
                          <Button
                            type="text"
                            size="small"
                            aria-label={`Actions for ${column.title}`}
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#0a0a0a" }}
                          />
                        </Dropdown>
                      </div>

                      {/* Droppable Task List */}
                      <Droppable
                        droppableId={`col-tasks-${column.columnId}`}
                        type="TASK"
                      >
                        {(tasksProvided, tasksSnapshot) => (
                          <div
                            ref={tasksProvided.innerRef}
                            {...tasksProvided.droppableProps}
                            className={`kanban-column-tasks${
                              tasksSnapshot.isDraggingOver
                                ? " kanban-column-tasks--dragging-over"
                                : ""
                            }`}
                          >
                            {tasks.map((task, taskIndex) => (
                              <Draggable
                                key={task.taskId}
                                draggableId={`task-${task.taskId}`}
                                index={taskIndex}
                                isDragDisabled={isDragDisabled}
                              >
                                {(taskProvided, taskSnapshot) => (
                                  <div
                                    ref={taskProvided.innerRef}
                                    {...taskProvided.draggableProps}
                                    {...taskProvided.dragHandleProps}
                                    className={`kanban-task-card${
                                      taskSnapshot.isDragging
                                        ? " kanban-task-card--dragging"
                                        : ""
                                    }`}
                                    style={{
                                      ...taskProvided.draggableProps.style,
                                      cursor: isDragDisabled
                                        ? "default"
                                        : "grab",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        gap: 8,
                                      }}
                                    >
                                      <strong
                                        style={{
                                          color: "#0a0a0a",
                                          fontSize: 14,
                                          lineHeight: 1.4,
                                          overflowWrap: "anywhere",
                                        }}
                                      >
                                        {task.title}
                                      </strong>
                                      <Dropdown
                                        trigger={["click"]}
                                        menu={{
                                          items: [
                                            { key: "edit", label: "Edit" },
                                            {
                                              key: "delete",
                                              label: "Delete",
                                              danger: true,
                                            },
                                          ],
                                          onClick: (info) => {
                                            info.domEvent.stopPropagation();
                                            if (info.key === "edit") {
                                              openEditModal(
                                                task,
                                                column.columnId,
                                              );
                                            } else if (info.key === "delete") {
                                              Modal.confirm({
                                                title: "Delete Task",
                                                icon: (
                                                  <ExclamationCircleFilled
                                                    style={{ color: "#0a0a0a" }}
                                                  />
                                                ),
                                                content: `Are you sure you want to delete "${task.title}"?`,
                                                okText: "Yes, Delete",
                                                okType: "danger",
                                                cancelText: "Cancel",
                                                onOk: () =>
                                                  handleDeleteTask(task.taskId),
                                              });
                                            }
                                          },
                                        }}
                                      >
                                        <Button
                                          type="text"
                                          size="small"
                                          aria-label={`Actions for ${task.title ?? "task"}`}
                                          icon={<MoreOutlined />}
                                          onClick={(e) => e.stopPropagation()}
                                          style={{
                                            color: "#525252",
                                            flexShrink: 0,
                                          }}
                                        />
                                      </Dropdown>
                                    </div>

                                    {task.description && (
                                      <p
                                        style={{
                                          color: "#525252",
                                          fontSize: 13,
                                          lineHeight: 1.5,
                                          marginTop: 6,
                                          marginBottom: 10,
                                          overflowWrap: "anywhere",
                                        }}
                                      >
                                        {task.description}
                                      </p>
                                    )}

                                    <div style={{ marginTop: 8 }}>
                                      <span
                                        className={`kanban-priority-badge kanban-priority-badge--${task.priority}`}
                                      >
                                        {task.priority}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {tasksProvided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      <div style={{ padding: "4px 12px 12px" }}>
                        <Button
                          block
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => onOpenCreateTask(column.columnId)}
                        >
                          Add Task
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {boardProvided.placeholder}
          </div>
        )}
      </Droppable>

      <Modal
        title={editTask ? "Edit Task" : "Create Task"}
        closable={{ "aria-label": "Close" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={resetModal}
        confirmLoading={loading}
        okText={editTask ? "Save Changes" : "Create Task"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            autoFocus
            placeholder="Enter task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onPressEnter={handleOk}
          />

          <TextArea
            rows={4}
            placeholder="Task description (optional)"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />

          <Select<Priority>
            value={priority}
            onChange={(value) => setPriority(value)}
            style={{ width: "100%" }}
            options={[
              { value: "LOW", label: "Low Priority" },
              { value: "MEDIUM", label: "Medium Priority" },
              { value: "HIGH", label: "High Priority" },
            ]}
          />
        </div>
      </Modal>
    </>
  );
};

export default BoardColumn;
