import { Breadcrumb, Layout, message, theme } from "antd";
import React, { useEffect, useState } from "react";
import {
  createBoard,
  getAllBoards,
  getByBoardId,
  updateBoard,
} from "./api/boardApi";
import type { BoardDetail, BoardSummary } from "./types/Kanban";

const { Content, Footer } = Layout;

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentYear = new Date().getFullYear();

  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

  const [currentBoard, setCurrentBoard] = useState<BoardDetail | null>(null);
  const [boardLoading, setBoardLoading] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [isEditingBoard, setIsEditingBoard] = useState<boolean>(false);
  const [boardNameInput, setBoardNameInput] = useState<string>("");

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoardId !== null) {
      fetchSingleBoard(selectedBoardId);
    } else {
      setCurrentBoard(null);
    }
  });
  const fetchBoards = async () => {
    try {
      const data = await getAllBoards();
      setBoards(data);
      if (data.length > 0 && selectedBoardId === null) {
        selectedBoardId(data[0].id);
      }
    } catch (error) {
      message.error("Fail to load board from server");
    }
  };

  const fetchSingleBoard = async (id: number) => {
    try {
      setBoardLoading(true);
      const data = getByBoardId(id);
      setCurrentBoard(data);
    } catch (error) {
      message.error("fail to load board details");
    } finally {
      setBoardLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditingBoard(false);
    setBoardNameInput("");
    setModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!currentBoard) return;
    setIsEditingBoard(true);
    setBoardNameInput(currentBoard.name);
    setModalOpen(true);
  };

  const handleSaveBoard = async () => {
    if (!boardNameInput.trim()) {
      message.warning("Board name is required!");
      return;
    }
    try {
      setModalLoading(true);
      if (isEditingBoard && currentBoard) {
        const update = await updateBoard(currentBoard.id, {
          name: currentBoard.name,
        });
        message.success("board updated");
        await fetchBoards();
        await fetchSingleBoard(update.id);
      } else {
        const create = await createBoard({ name: boardNameInput.trim() });
        message.success("board created");
        await fetchBoards();
        await fetchSingleBoard(create.id);
      }

      setModalOpen(false);
    } catch (error) {
      message.error("Failed to save board");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Layout>
      <Content style={{ padding: "0 48px" }}>
        <Breadcrumb
          style={{ margin: "16px 0" }}
          items={[{ title: "Home" }, { title: "List" }, { title: "App" }]}
        />
        <div
          style={{
            padding: 24,
            minHeight: 380,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Content
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Ant Design ©{currentYear} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default App;
