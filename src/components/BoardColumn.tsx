import { ExclamationCircleFilled, MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Input,
  message,
  Modal,
  Select,
  Tag,
} from "antd";
import React, { useState } from "react";
import { createTask, deleteTask, updateTask } from "../api/taskApi";
import type { BoardColumnType, Priority, Task } from "../types/Kanban";

const { TextArea } = Input;

interface BoardColumnProps {
  columnList: BoardColumnType[];
  editModel: (column: BoardColumnType) => void;
  handleDelete: (id: number) => void;
  onTaskCreated: (newTask: Task) => void;
  handleTaskDelete: (id: number) => void;
  handleTaskUpdate: (updateTask: Task) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  columnList,
  editModel,
  handleDelete,
  onTaskCreated,
  handleTaskDelete,
  handleTaskUpdate,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModelOpen] = useState(false);
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
      message.error("Fail to delete a task");
      console.log(error);
    }
  };

  const handleTaskEdit = async (taskToEdit: Task) => {
    // 1. Send the update to the backend
    await updateTask(taskToEdit.taskId, {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      position: taskToEdit.position,
      priority: priority,
    });

    // 2. Manually construct the updated task for React using the form state!
    const updatedTaskForUI: Task = {
      ...taskToEdit, // Keeps the original taskId, columnId, etc.
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      priority: priority,
    };

    // 3. Send our perfectly shaped object to BoardView to update the screen
    handleTaskUpdate(updatedTaskForUI);
    message.success("Task updated successfully");
  };

  const handleTaskCreate = async () => {
    const currentCol = columnList.find((c) => c.columnId === selectedColumnId);
    const nextPosition = (currentCol?.tasks?.length || 0) + 1;

    // 1. Call the API and capture the newly created task
    const newTask = await createTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      position: nextPosition,
      columnId: selectedColumnId as number, // Guaranteed to be a number by this point
      priority: priority,
    });

    // 2. Pass it to the UI
    onTaskCreated(newTask);
    message.success("Task created successfully");
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

      // Cleanup runs only if the await functions above succeed
      setIsModelOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setPriority("LOW");
      setEditTask(null);
      setSelectedColumnId(null);
    } catch (error) {
      message.error(editTask ? "Fail to update task" : "Fail to create task");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModelOpen(false);
    setTaskTitle("");
    setTaskDesc("");
    setPriority("LOW");
    setEditTask(null);
    setSelectedColumnId(null);
  };

  const openEditModal = (oldTask: Task, columnId: number) => {
    setIsModelOpen(true);
    setEditTask(oldTask);
    setTaskTitle(oldTask.title ?? "");
    setTaskDesc(oldTask.description ?? "");
    setPriority(oldTask.priority);
    setSelectedColumnId(columnId);
  };

  const onOpenCreateTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setIsModelOpen(true);
    setEditTask(null);
    setTaskTitle("");
    setTaskDesc("");
    setPriority("LOW");
  };

  const getPriorityColor = (prio: Priority) => {
    if (prio === "HIGH") return "volcano"; // A softer, more modern red in Ant Design
    if (prio === "MEDIUM") return "gold";
    return "cyan";
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 16,
          marginTop: 16,
          alignItems: "flex-start",
        }}
      >
        {columnList.map((column) => (
          <Card
            key={column.columnId}
            title={column.title}
            extra={
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    { key: "edit", label: "Edit" },
                    { key: "delete", label: "Delete", danger: true },
                  ],
                  onClick: (info) => {
                    if (info.key === "edit") {
                      editModel(column);
                    } else if (info.key === "delete") {
                      Modal.confirm({
                        title: "Delete Column",
                        icon: <ExclamationCircleFilled />,
                        content: `Are you sure you want to delete "${column.title}"?`,
                        okText: "Yes, Delete",
                        okType: "danger",
                        cancelText: "Cancel",
                        onOk: () => {
                          handleDelete(column.columnId);
                        },
                      });
                    }
                  },
                }}
              >
                <MoreOutlined style={{ cursor: "pointer" }} />
              </Dropdown>
            }
            variant="borderless"
            style={{
              width: 300,
              flexShrink: 0,
              background: "#f4f5f7",
            }}
          >
            {/* Render the Tasks inside this Column */}
            {(column.tasks || []).map((task) => (
              <Card
                key={task.taskId}
                size="small"
                variant="borderless"
                style={{ marginBottom: 10, background: "#fff" }}
                extra={
                  <Dropdown
                    trigger={["hover"]}
                    menu={{
                      items: [
                        { key: "edit", label: "Edit" },
                        { key: "delete", label: "Delete", danger: true },
                      ],
                      onClick: (info) => {
                        if (info.key === "edit") {
                          openEditModal(task, column.columnId);
                        } else if (info.key === "delete") {
                          Modal.confirm({
                            title: "Delete Task",
                            icon: <ExclamationCircleFilled />,
                            content: `Are you sure you want to delete "${task.title}"?`,
                            okText: "Yes, Delete",
                            okType: "danger",
                            cancelText: "Cancel",
                            onOk: () => {
                              handleDeleteTask(task.taskId);
                            },
                          });
                        }
                      },
                    }}
                  >
                    <MoreOutlined style={{ cursor: "pointer" }} />
                  </Dropdown>
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <strong>{task.title}</strong>
                </div>
                {task.description && (
                  <p
                    style={{
                      color: "#666",
                      fontSize: "13px",
                      marginTop: 4,
                      marginBottom: 8,
                    }}
                  >
                    {task.description}
                  </p>
                )}
                <Tag
                  color={getPriorityColor(task.priority)}
                  style={{ marginTop: 4 }}
                >
                  {task.priority}
                </Tag>
              </Card>
            ))}

            <Button
              block
              type="dashed"
              onClick={() => onOpenCreateTask(column.columnId)}
              style={{ marginTop: 8 }}
            >
              + Add Task
            </Button>
          </Card>
        ))}
      </div>

      <Modal
        title={editTask ? "Edit Task" : "Create Task"}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter Task Title"
          style={{ marginBottom: 10 }}
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />

        <TextArea
          rows={4}
          placeholder="Task Description"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
        />

        <Select
          value={priority}
          onChange={(value) => setPriority(value)}
          style={{ width: "100%", marginTop: 10 }}
          options={[
            { value: "LOW", label: "Low Priority" },
            { value: "MEDIUM", label: "Medium Priority" },
            { value: "HIGH", label: "High Priority" },
          ]}
        />
      </Modal>
    </>
  );
};

export default BoardColumn;
