import { MoreOutlined } from "@ant-design/icons";
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
import type { BoardColumnType, Priority, Task } from "../types/Kanban";
import { createTask } from "../api/taskApi";

const { TextArea } = Input;

interface BoardColumnProps {
  columnList: BoardColumnType[];
  editModel: (column: BoardColumnType) => void;
  handleDelete: (id: number) => void;
  onTaskCreated: (newTask: Task) => void; // <-- 1. Receive the prop
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  columnList,
  editModel,
  handleDelete,
  onTaskCreated,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModelOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);

  const [priority, setPriority] = useState<Priority>("LOW");
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");

  const handleOk = async () => {
    if (!taskTitle.trim() || selectedColumnId === null) {
      message.warning("Task title is required");
      return;
    }

    setLoading(true);

    try {
      const currentCol = columnList.find(
        (c) => c.columnId === selectedColumnId,
      );
      const nextPosition = (currentCol?.tasks?.length || 0) + 1;

      const data = await createTask({
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        position: nextPosition,
        columnId: selectedColumnId,
        priority: priority,
      });

      onTaskCreated(data); // <-- 2. Send the new task up to BoardView to update the screen!
      message.success("Task created successfully");

      setIsModelOpen(false);
      setTaskTitle("");
      setTaskDesc("");
      setPriority("LOW");
    } catch (error) {
      message.error("Fail to create task");
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
  };

  const onOpenCreateTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setIsModelOpen(true);
  };

  // Helper function for Tag colors
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
                      handleDelete(column.columnId);
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
            {/* 3. Render the Tasks! Loop over column.tasks */}
            {(column.tasks || []).map((task) => (
              <Card
                key={task.taskId}
                size="small"
                variant="borderless"
                style={{ marginBottom: 10, background: "#fff" }}
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
        title="Create Task"
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
