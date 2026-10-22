import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, theme } from "antd";

const { Header } = Layout;

interface BoardHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateModal: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenCreateModal,
}) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Header
      style={{
        padding: "0 24px 0 0",
        background: colorBgContainer,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggleCollapse}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />
      <Button type="primary" onClick={onOpenCreateModal}>
        Create Board
      </Button>
    </Header>
  );
};

export default BoardHeader;
