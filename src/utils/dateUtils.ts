import dayjs from "dayjs";
import type { DueFilter } from "../types/Kanban";

export type DueStatus =
  | "OVERDUE"
  | "DUE_TODAY"
  | "UPCOMING"
  | "COMPLETED"
  | "NONE";

export function getLocalTodayString(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function getTaskDueStatus(
  dueDate: string | null,
  isColumnCompleted: boolean,
  todayStr: string,
): DueStatus {
  if (!dueDate) return "NONE";
  if (isColumnCompleted) return "COMPLETED";
  if (dueDate < todayStr) return "OVERDUE";
  if (dueDate === todayStr) return "DUE_TODAY";
  return "UPCOMING";
}

export function formatDueDateLabel(
  dueDate: string,
  status: DueStatus,
  todayStr: string,
): string {
  if (status === "DUE_TODAY") return "Due today";

  const parsed = dayjs(dueDate, "YYYY-MM-DD");
  const currentYear = dayjs(todayStr, "YYYY-MM-DD").year();
  const formatted =
    parsed.year() === currentYear
      ? parsed.format("MMM D")
      : parsed.format("MMM D, YYYY");

  if (status === "OVERDUE") return `Overdue · ${formatted}`;
  return formatted;
}

export function matchesDueFilter(
  dueDate: string | null,
  isColumnCompleted: boolean,
  dueFilter: DueFilter,
  todayStr: string,
): boolean {
  if (dueFilter === "ALL") return true;
  if (dueFilter === "NO_DUE_DATE") return !dueDate;
  if (isColumnCompleted || !dueDate) return false;

  if (dueFilter === "OVERDUE") return dueDate < todayStr;
  if (dueFilter === "TODAY") return dueDate === todayStr;

  const weekEndStr = dayjs(todayStr, "YYYY-MM-DD")
    .add(7, "day")
    .format("YYYY-MM-DD");
  return dueDate >= todayStr && dueDate <= weekEndStr;
}

export function formatAuditTimestamp(isoString: string | null): string {
  if (!isoString) return "—";
  const parsed = dayjs(isoString);
  return parsed.isValid() ? parsed.format("MMM D, YYYY · h:mm A") : "—";
}
