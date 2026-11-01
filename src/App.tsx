import React, { useEffect, useState } from "react";

import { MoreOutlined, ProjectOutlined } from "@ant-design/icons";
import { Dropdown, Input, Layout, Menu, message, Modal } from "antd";
import {
  createBoard,
  deleteBoard,
  getAllBoards,
  getByBoardId,
  updateBoard,
} from "./api/boardApi";
import BoardHeader from "./components/BoardHeader";
import type { BoardDetail, BoardSummary } from "./types/Kanban";
import BoardView from "./components/BoardView";

const { Sider } = Layout;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardNameInput, setBoardNameInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [boardList, setBoardList] = useState<BoardSummary[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [currentBoard, setCurrentBoard] = useState<BoardDetail | null>(null);
  const [editBoard, setEditBoard] = useState<BoardSummary | null>(null);

  const showCreateModal = () => {
    setEditBoard(null);
    setBoardNameInput("");
    setIsModalOpen(true);
  };

  const showEditModel = (board: BoardSummary) => {
    setEditBoard(board);
    setBoardNameInput(board.name);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!boardNameInput.trim()) {
      message.warning("Board name is required");
      return;
    }

    try {
      setLoading(true);

      if (editBoard) {
        const updated = await updateBoard(editBoard.id, {
          name: boardNameInput.trim(),
        });

        setBoardList((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
        if (currentBoard && currentBoard.id === updated.id) {
          setCurrentBoard({ ...currentBoard, name: updated.name });
        }
        message.success("Board Updated Successfully");
      } else {
        const data = await createBoard({ name: boardNameInput.trim() });
        setBoardList((prev) => [...prev, data]);
        message.success("Board Create Successful");
      }
      setBoardNameInput("");
      setEditBoard(null);
      setIsModalOpen(false);
    } catch (error) {
      message.error(
        editBoard ? "fail to updated Board " : "fail to create board",
      );
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setBoardNameInput("");
    setEditBoard(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBoard(id);
      setBoardList((prev) => prev.filter((b) => b.id !== id));
      if (selectedBoardId == id) {
        setSelectedBoardId(null);
        setCurrentBoard(null);
      }
      message.success("delete board success");
    } catch (error) {
      message.error("fail to delete a board");
      console.log(error);
    }
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
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0, // REQUIRED in Flexbox so the span is allowed to shrink!
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {board.name}
                  </span>
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
                          showEditModel(board);
                        } else if (info.key === "delete") {
                          handleDelete(board.id);
                        }
                      },
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
            onOpenCreateModal={showCreateModal}
          />

          <BoardView boardData={currentBoard} />
        </Layout>
      </Layout>

      <Modal
        title={editBoard ? "update board" : "create board"}
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
