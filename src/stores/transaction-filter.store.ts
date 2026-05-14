import { create } from "zustand";
import dayjs from "dayjs";

export type Period = "day" | "week" | "month" | "quarter" | "year" | "all" | "custom";
export type TransactionFilterType = "all" | "income" | "expense" | "transfer";

interface TransactionFilterState {
  period: Period;
  filterType: TransactionFilterType;
  startDate: string;
  endDate: string;
  isCustom: boolean;
  setPeriod: (period: Period) => void;
  setCustomRange: (start: string, end: string) => void;
  setFilterType: (type: TransactionFilterType) => void;
  goNext: () => void;
  goPrev: () => void;
}

function getRange(period: Period, base?: dayjs.Dayjs): { start: string; end: string } {
  const d = base || dayjs();
  switch (period) {
    case "day":
      return { start: d.startOf("day").toISOString(), end: d.endOf("day").toISOString() };
    case "week":
      return { start: d.startOf("week").toISOString(), end: d.endOf("week").toISOString() };
    case "month":
      return { start: d.startOf("month").toISOString(), end: d.endOf("month").toISOString() };
    case "quarter":
      return { start: d.startOf("quarter").toISOString(), end: d.endOf("quarter").toISOString() };
    case "year":
      return { start: d.startOf("year").toISOString(), end: d.endOf("year").toISOString() };
    case "all":
    case "custom":
      return { start: "", end: "" };
  }
}

function getLabel(period: Period, start: string, end: string): string {
  switch (period) {
    case "day":
      return dayjs(start).format("DD MMM YYYY");
    case "week":
      return `${dayjs(start).format("DD MMM")} – ${dayjs(end).format("DD MMM YYYY")}`;
    case "month":
      return dayjs(start).format("MMMM YYYY");
    case "quarter": {
      const month = dayjs(start).month();
      const year = dayjs(start).format("YYYY");
      const quarters = [
        "Jan – Mar",
        "Apr – Jun",
        "Jul – Sep",
        "Oct – Dec",
      ];
      return `${quarters[Math.floor(month / 3)]} ${year}`;
    }
    case "year":
      return dayjs(start).format("YYYY");
    case "all":
      return "All Time";
    case "custom":
      return `${dayjs(start).format("DD MMM YYYY")} – ${dayjs(end).format("DD MMM YYYY")}`;
  }
}

export const useTransactionFilter = create<TransactionFilterState>((set, get) => {
  const initPeriod = "month";
  const initRange = getRange(initPeriod);

  return {
    period: initPeriod,
    filterType: "all",
    startDate: initRange.start,
    endDate: initRange.end,
    isCustom: false,
    setPeriod: (period) => {
      const range = getRange(period);
      set({ period, startDate: range.start, endDate: range.end, isCustom: false });
    },
    setCustomRange: (start, end) => {
      set({ period: "custom", startDate: start, endDate: end, isCustom: true });
    },
    setFilterType: (filterType) => set({ filterType }),
    goNext: () => {
      const { period, startDate } = get();
      if (period === "all" || period === "custom") return;
      const unit = period === "quarter" ? "month" : period;
      const amount = period === "quarter" ? 3 : 1;
      const next = dayjs(startDate).add(amount, unit);
      const range = getRange(period, next);
      set({ startDate: range.start, endDate: range.end });
    },
    goPrev: () => {
      const { period, startDate } = get();
      if (period === "all" || period === "custom") return;
      const unit = period === "quarter" ? "month" : period;
      const amount = period === "quarter" ? 3 : 1;
      const prev = dayjs(startDate).subtract(amount, unit);
      const range = getRange(period, prev);
      set({ startDate: range.start, endDate: range.end });
    },
  };
});

export function getPeriodLabel(period: Period, startDate: string, endDate: string): string {
  return getLabel(period, startDate, endDate);
}