import { Layout, message } from "antd";
import BoardColumn from "./BoardColumn";
import { Button, Modal, Input } from "antd";
import { theme } from "antd";
import type { BoardColumnType, BoardDetail } from "../types/Kanban";
import type React from "react";
import { useEffect, useState } from "react";
import { createBoardColumn } from "../api/columnApi";

interface BoardViewProps {
  boardData: BoardDetail | null;
}

const BoardView: React.FC<BoardViewProps> = ({ boardData }) => {
  const { Content } = Layout;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [columnNameInput, setColumnNameInput] = useState<string>("");
  const [columnList, setColumnList] = useState<BoardColumnType>([]);

  const openModel = () => {
    setIsModalOpen(true);
    setColumnNameInput("");
  };

  const handleOk = async () => {
    if (!columnNameInput.trim) {
      message.warning("column name is required");
      return;
    }

    try {
      setLoading(true);
      setIsModalOpen(false);

      const data = await createBoardColumn();
    } catch (error) {
      message.error("fail create column");
      console.log(error);
    }
  };

  useEffect(() => {
    if (boardData) {
      setColumnList(boardData.boardColumnResponseList || []);
    }
  }, [boardData]);

  const handleCancel = () => {};

  return (
    <div>
      <Content
        style={{
          margin: "24px 16px",
          padding: 24,
          minHeight: 280,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
          overflowX: "auto",
        }}
      >
        {boardData ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2>{boardData.name}</h2>
                <p>Board ID :{boardData.id}</p>
              </div>

              <Button type="primary" onClick={openModel}>
                + Create Column
              </Button>
            </div>
            <BoardColumn />
          </div>
        ) : (
          <p>Please Select a board from Menu</p>
        )}
      </Content>
      <Modal
        title="title"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter Board Name"
          value={columnNameInput}
          onChange={(e) => setColumnNameInput(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default BoardView;
