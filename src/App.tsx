import React, { useEffect, useState } from "react";

import { MoreOutlined, ProjectOutlined } from "@ant-design/icons";
import { Dropdown, Input, Layout, Menu, message, Modal, theme } from "antd";
import { createBoard, getAllBoards, getByBoardId } from "./api/boardApi";
import BoardHeader from "./components/BoardHeader";
import type { BoardDetail, BoardSummary } from "./types/Kanban";

const { Sider, Content } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardNameInput, setBoardNameInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [boardList, setBoardList] = useState<BoardSummary[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [currentBoard, setCurrentBoard] = useState<BoardDetail | null>(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!boardNameInput.trim()) {
      message.warning("Board name is required");
      return;
    }

    try {
      setLoading(true);
      const data = await createBoard({ name: boardNameInput.trim() });
      setBoardList((prev) => [...prev, data]);
      message.success("Board Create Successful");
      setBoardNameInput("");
      setIsModalOpen(false);
    } catch (error) {
      message.error("fail to create board");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setBoardNameInput("");
  };

  const fetchBoard = async () => {
    try {
      const data = await getAllBoards();
      if (data.length > 0) {
        setSelectedBoardId(data[0].id);
      }
      setBoardList(data);
    } catch (error) {
      message.error("fail to fetch board ");
      console.log(error);
    }
  };

  const fetchBoardById = async (id: number) => {
    try {
      const data = await getByBoardId(id);
      setCurrentBoard(data);
    } catch (error) {
      message.error("fail to fetchBoardById");
      console.log(error);
    }
  };

  useEffect(() => {
    if (selectedBoardId !== null) {
      fetchBoardById(selectedBoardId);
    }
  }, [selectedBoardId]);

  useEffect(() => {
    fetchBoard();
  }, []);

  return (
    <>
      <Layout style={{ height: "100vh" }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div
            className="demo-logo-vertical"
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              gap: 8,
            }}
          >
            <ProjectOutlined style={{ fontSize: 22, color: "#1677ff" }} />
            {!collapsed && <span>Kanban</span>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedBoardId ? [String(selectedBoardId)] : []}
            onClick={(info) => setSelectedBoardId(Number(info.key))}
            items={boardList.map((board) => ({
              key: String(board.id),
              icon: <ProjectOutlined />,
              label: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{board.name}</span>
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: [
                        { key: "edit", label: "Edit" },
                        { key: "delete", label: "Delete", danger: true },
                      ],
                    }}
                  >
                    <MoreOutlined onClick={(e) => e.stopPropagation()} />
                  </Dropdown>
                </div>
              ),
            }))}
          />
        </Sider>
        <Layout style={{ minHeight: "100vh" }}>
          <BoardHeader
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            onOpenCreateModal={showModal}
          />

          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {currentBoard ? (
              <div>
                <h2>{currentBoard.name}</h2>
                <p>Board ID :{currentBoard.id}</p>
              </div>
            ) : (
              <p>Please Select a board from Menu</p>
            )}
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="Create Board"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter Board Name"
          value={boardNameInput}
          onChange={(e) => setBoardNameInput(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default App;
