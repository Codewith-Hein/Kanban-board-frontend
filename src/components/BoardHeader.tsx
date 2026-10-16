import { Layout, Typography } from "antd";
import type { BoardSummary } from "../types/Kanban";

const { Header } = Layout;
const { Title } = Typography;

interface BoardHeaderProps {
  boards: BoardSummary[];
  selectedBoardId: number | null;
  onSelecteBoard: (boardId: number) => void;
  onOpenCreateModal: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = () => {
  return <div>BoardHeader</div>;
};

export default BoardHeader;
