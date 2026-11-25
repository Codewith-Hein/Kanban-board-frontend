import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Layout, Typography } from "antd";
import type React from "react";

const { Header } = Layout;
const { Text } = Typography;

interface BoardHeaderProps {
  collapsed: boolean;
  boardName?: string;
  onToggleCollapse: () => void;
  onOpenCreateModal: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  collapsed,
  boardName,
  onToggleCollapse,
  onOpenCreateModal,
}) => {
  return (
    <Header
      style={{
        padding: "0 24px 0 8px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 64,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Button
          type="text"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          style={{
            fontSize: 16,
            width: 48,
            height: 48,
            color: "#0a0a0a",
          }}
        />
        {boardName && (
          <Text
            style={{
              fontSize: 14,
              color: "#737373",
              fontWeight: 500,
            }}
          >
            Workspace /{" "}
            <span style={{ color: "#0a0a0a", fontWeight: 600 }}>
              {boardName}
            </span>
          </Text>
        )}
      </div>

      <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreateModal}>
        Create Board
      </Button>
    </Header>
  );
};

export default BoardHeader;
