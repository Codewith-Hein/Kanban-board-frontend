import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  ExclamationCircleFilled,
  MoreOutlined,
} from "@ant-design/icons";
import {
  ConfigProvider,
  Dropdown,
  Input,
  Layout,
  Menu,
  message,
  Modal,
} from "antd";
import { getErrorMessage } from "./api/axiosClient";
import {
  createBoard,
  deleteBoard,
  getAllBoards,
  getByBoardId,
  updateBoard,
} from "./api/boardApi";
import BoardHeader from "./components/BoardHeader";
import BoardView from "./components/BoardView";
import type {
  BoardColumnType,
  BoardDetail,
  BoardSummary,
} from "./types/Kanban";

const { Sider } = Layout;

const monochromeTheme = {
  token: {
    colorPrimary: "#0a0a0a",
    colorInfo: "#0a0a0a",
    colorLink: "#0a0a0a",
    colorLinkHover: "#404040",
    colorText: "#0a0a0a",
    colorTextSecondary: "#525252",
    colorBgLayout: "#fafafa",
    colorBgContainer: "#ffffff",
    colorBorder: "#e5e5e5",
    colorBorderSecondary: "#efefef",
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      siderBg: "#ffffff",
      headerBg: "#ffffff",
      bodyBg: "#fafafa",
    },
    Menu: {
      itemBg: "#ffffff",
      itemColor: "#262626",
      itemHoverBg: "#f5f5f5",
      itemHoverColor: "#0a0a0a",
      itemSelectedBg: "#f0f0f0",
      itemSelectedColor: "#0a0a0a",
      activeBarBorderWidth: 0,
      itemBorderRadius: 6,
      itemMarginInline: 8,
      iconSize: 22,
      collapsedIconSize: 22,
    },
    Button: {
      primaryColor: "#ffffff",
      primaryShadow: "none",
      defaultBg: "#ffffff",
      defaultColor: "#0a0a0a",
      defaultBorderColor: "#d4d4d4",
      defaultHoverBg: "#f5f5f5",
      defaultHoverColor: "#0a0a0a",
      defaultHoverBorderColor: "#0a0a0a",
      defaultActiveBg: "#e5e5e5",
      defaultActiveColor: "#0a0a0a",
      defaultActiveBorderColor: "#0a0a0a",
    },
    Input: {
      activeBorderColor: "#0a0a0a",
      hoverBorderColor: "#525252",
      activeShadow: "0 0 0 2px rgba(10, 10, 10, 0.08)",
    },
    Select: {
      activeBorderColor: "#0a0a0a",
      hoverBorderColor: "#525252",
      activeOutlineColor: "rgba(10, 10, 10, 0.08)",
      optionSelectedBg: "#f5f5f5",
    },
    Modal: {
      contentBg: "#ffffff",
      headerBg: "#ffffff",
      titleColor: "#0a0a0a",
    },
  },
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardNameInput, setBoardNameInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [boardList, setBoardList] = useState<BoardSummary[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [currentBoard, setCurrentBoard] = useState<BoardDetail | null>(null);
  const [editBoard, setEditBoard] = useState<BoardSummary | null>(null);
  const [boardLoading, setBoardLoading] = useState<boolean>(false);

  const requestId = useRef(0);

  const selectBoard = useCallback((id: number) => {
    setSelectedBoardId((prev) => {
      if (prev !== id) {
        setBoardLoading(true);
      }
      return id;
    });
  }, []);

  const showCreateModal = () => {
    setEditBoard(null);
    setBoardNameInput("");
    setIsModalOpen(true);
  };

  const showEditModal = (board: BoardSummary) => {
    setEditBoard(board);
    setBoardNameInput(board.name);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const trimmedName = boardNameInput.trim();
    if (!trimmedName) {
      message.warning("Board name is required");
      return;
    }

    try {
      setLoading(true);

      if (editBoard) {
        const updated = await updateBoard(editBoard.id, {
          name: trimmedName,
        });

        setBoardList((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
        setCurrentBoard((prev) =>
          prev && prev.id === updated.id
            ? { ...prev, name: updated.name }
            : prev,
        );
        message.success("Board updated successfully");
      } else {
        const created = await createBoard({ name: trimmedName });
        setBoardList((prev) => [...prev, created]);
        selectBoard(created.id);
        message.success("Board created successfully");
      }
      setBoardNameInput("");
      setEditBoard(null);
      setIsModalOpen(false);
    } catch (error) {
      message.error(
        getErrorMessage(
          error,
          editBoard ? "Failed to update board" : "Failed to create board",
        ),
      );
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
      const remaining = boardList.filter((b) => b.id !== id);
      setBoardList(remaining);

      if (selectedBoardId === id) {
        if (remaining.length > 0) {
          selectBoard(remaining[0].id);
        } else {
          setSelectedBoardId(null);
          setCurrentBoard(null);
          setBoardLoading(false);
        }
      }
      message.success("Board deleted successfully");
    } catch (error) {
      message.error(getErrorMessage(error, "Failed to delete board"));
    }
  };

  const handleBoardColumnsChange = useCallback(
    (updater: (prevCols: BoardColumnType[]) => BoardColumnType[]) => {
      setCurrentBoard((prev) =>
        prev
          ? {
              ...prev,
              boardColumnResponseList: updater(
                prev.boardColumnResponseList || [],
              ),
            }
          : prev,
      );
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    getAllBoards()
      .then((data) => {
        if (cancelled) return;
        setBoardList(data);
        if (data.length > 0) {
          setBoardLoading(true);
          setSelectedBoardId(data[0].id);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          message.error(getErrorMessage(error, "Failed to fetch boards"));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedBoardId === null) return;

    let cancelled = false;
    const currentRequestId = ++requestId.current;

    getByBoardId(selectedBoardId)
      .then((data) => {
        if (!cancelled && currentRequestId === requestId.current) {
          setCurrentBoard(data);
        }
      })
      .catch((error) => {
        if (!cancelled && currentRequestId === requestId.current) {
          message.error(getErrorMessage(error, "Failed to load board details"));
        }
      })
      .finally(() => {
        if (!cancelled && currentRequestId === requestId.current) {
          setBoardLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBoardId]);

  return (
    <ConfigProvider theme={monochromeTheme}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={240}
          style={{
            background: "#ffffff",
            borderRight: "1px solid #e5e5e5",
          }}
        >
          <div
            style={{
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              padding: collapsed ? 0 : "0 20px",
              color: "#0a0a0a",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              gap: 10,
              borderBottom: "1px solid #efefef",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                background: "#0a0a0a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="1.5"
                  y="2"
                  width="3.5"
                  height="12"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="6.25"
                  y="2"
                  width="3.5"
                  height="8.5"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="11"
                  y="2"
                  width="3.5"
                  height="10.5"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            </div>
            {!collapsed && <span>Kanban</span>}
          </div>

          {!collapsed && (
            <div
              style={{
                padding: "16px 20px 8px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#737373",
                textTransform: "uppercase",
              }}
            >
              Boards ({boardList.length})
            </div>
          )}

          <Menu
            className="kanban-sider-menu"
            theme="light"
            mode="inline"
            selectedKeys={selectedBoardId ? [String(selectedBoardId)] : []}
            onClick={(info) => selectBoard(Number(info.key))}
            items={boardList.map((board) => {
              const initial =
                Array.from(board.name.trim())[0]?.toUpperCase() || "B";
              const isSelected = selectedBoardId === board.id;

              return {
                key: String(board.id),
                icon: (
                  <span className="kanban-board-icon-slot">
                    <span
                      className={`kanban-board-badge${
                        isSelected ? " kanban-board-badge--active" : ""
                      }`}
                    >
                      {initial}
                    </span>
                  </span>
                ),
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
                      minWidth: 0,
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
                          showEditModal(board);
                        } else if (info.key === "delete") {
                          Modal.confirm({
                            title: "Delete Board",
                            icon: (
                              <ExclamationCircleFilled
                                style={{ color: "#0a0a0a" }}
                              />
                            ),
                            content: `Are you sure you want to delete the board "${board.name}"? Everything inside it will be permanently deleted.`,
                            okText: "Yes, Delete Board",
                            okType: "danger",
                            cancelText: "Cancel",
                            onOk: () => handleDelete(board.id),
                          });
                        }
                      },
                    }}
                  >
                    <span
                      className="kanban-board-action-trigger"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreOutlined />
                    </span>
                  </Dropdown>
                </div>
              ),
            };
            })}
          />
        </Sider>

        <Layout style={{ minHeight: "100vh", background: "#fafafa" }}>
          <BoardHeader
            collapsed={collapsed}
            boardName={currentBoard?.name}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
            onOpenCreateModal={showCreateModal}
          />

          <BoardView
            currentBoard={currentBoard}
            boardLoading={boardLoading}
            onBoardColumnsChange={handleBoardColumnsChange}
            onOpenCreateBoardModal={showCreateModal}
          />
        </Layout>
      </Layout>

      <Modal
        title={editBoard ? "Update Board" : "Create Board"}
        closable={{ "aria-label": "Close" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText={editBoard ? "Save Changes" : "Create Board"}
      >
        <Input
          autoFocus
          placeholder="Enter board name"
          value={boardNameInput}
          onChange={(e) => setBoardNameInput(e.target.value)}
          onPressEnter={handleOk}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default App;
