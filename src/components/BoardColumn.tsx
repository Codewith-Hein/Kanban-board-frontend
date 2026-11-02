import { MoreOutlined } from "@ant-design/icons";
import { Card, Dropdown } from "antd";
import React from "react";
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
}) => (
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
        Card content
      </Card>
    ))}
  </div>
);

export default BoardColumn;
