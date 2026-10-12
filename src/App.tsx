import { useEffect, useState } from "react";
import TaskCreateForm from "./components/TaskCreateForm";
import { getBoardByid } from "./service/boardApi";
import type { Board } from "./types/Kanban";
const App = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoardApi = async () => {
    try {
      const result = await getBoardByid(1);
      setBoard(result);
    } catch {
      setError("Invalid Board ID");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardApi();
  }, []);

  if (loading) return <p>Loading board.....</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!board) return <p>Board not found.</p>;

  return (
    <div style={{ padding: 25 }}>
      <TaskCreateForm />
      {/* <KanbanBoard board={board} /> */}
    </div>
  );
};

export default App;
