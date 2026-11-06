import { MoreOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Input, Modal } from "antd";
import React, { useState } from "react";
import type { BoardColumnType } from "../types/Kanban";
interface BoardColumnProps {
  columnList: BoardColumnType[];
  editModel: (column: BoardColumnType) => void;
  handleDelete: (id: number) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  columnList,
  editModel,
  handleDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModelOpen] = useState(false);

  const handleOk = () => {};
  const handleCancel = () => {};

  const onOpenCreateTask = (columnId: number) => {
    setIsModelOpen(true);
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
              flexShrink: 0, // Stops columns from getting squished when you have 5+ columns!
              background: "#f4f5f7", // Soft gray column background
            }}
          >
            <Card
              size="small"
              variant="borderless"
              style={{ marginBottom: 10, background: "#fff" }}
            >
              Sample Task inside
            </Card>{" "}
            <Button
              block
              type="dashed"
              onClick={() => {
                onOpenCreateTask(column.columnId);
                console.log(column.columnId);
              }}
            >
              + Add Task
            </Button>
            .{" "}
          </Card>
        ))}
      </div>
      <Modal
        title="Task Title"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Input placeholder="Enter Task Title" />
      </Modal>
    </>
  );
};

export default BoardColumn;
