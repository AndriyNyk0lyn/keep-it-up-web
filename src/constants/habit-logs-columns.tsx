import { createColumnHelper } from "@tanstack/react-table";
import type { HabitLog } from "@/types/habit";
import { formatDate, formatDateWithTime } from "@/lib/utils/date-formatting";

const columnHelper = createColumnHelper<HabitLog>();

export const habitLogsColumns = [
  columnHelper.accessor("date", {
    header: "Date",
    cell: (info) => {
      const date = new Date(info.getValue() + "T00:00:00");
      return formatDate(date);
    },
  }),
  columnHelper.accessor("note", {
    header: "Note",
    cell: (info) => info.getValue() || "-",
  }),
  columnHelper.accessor("updatedAt", {
    header: "Logged At",
    cell: (info) => {
      const date = new Date(info.getValue());
      return formatDateWithTime(date);
    },
  }),
];
