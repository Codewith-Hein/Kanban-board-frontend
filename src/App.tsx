import React, { useState } from "react";

import { Button, Input, message, Modal } from "antd";
import { createBoard } from "./api/boardApi";

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardNameInput, setBoardNameInput] = useState<string>("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!boardNameInput.trim()) {
      message.warning("Board name is required");
      return;
    }

    try {
      const data = await createBoard({ name: boardNameInput.trim() });
      message.success("Board Create Successful");
      setBoardNameInput("");
      setIsModalOpen(false);
    } catch (error) {
      message.error("fail to create board");
      console.log(error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setBoardNameInput("");
  };

  return (
    <>
      <div className="main">
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
        <Modal
          title="Create Board"
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Input
            placeholder="Enter Board Name"
            value={boardNameInput}
            onChange={(e) => setBoardNameInput(e.target.value)}
          />
        </Modal>
      </div>
    </>
  );
};

export default App;
