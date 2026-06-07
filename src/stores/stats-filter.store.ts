import { create } from "zustand";
import dayjs from "dayjs";

export type StatsPeriod = "week" | "month" | "quarter" | "year";
export type StatsType = "income" | "expense";

interface StatsFilterState {
  period: StatsPeriod;
  type: StatsType;
  startDate: string;
  endDate: string;
  setPeriod: (period: StatsPeriod) => void;
  setType: (type: StatsType) => void;
  goNext: () => void;
  goPrev: () => void;
}

function getRange(period: StatsPeriod, base?: dayjs.Dayjs): { start: string; end: string } {
  const d = base || dayjs();
  switch (period) {
    case "week":
      return { start: d.startOf("week").toISOString(), end: d.endOf("week").toISOString() };
    case "month":
      return { start: d.startOf("month").toISOString(), end: d.endOf("month").toISOString() };
    case "quarter":
      return { start: d.startOf("quarter" as any).toISOString(), end: d.endOf("quarter" as any).toISOString() };
    case "year":
      return { start: d.startOf("year").toISOString(), end: d.endOf("year").toISOString() };
  }
}

function getLabel(period: StatsPeriod, start: string, end: string): string {
  switch (period) {
    case "week":
      return `${dayjs(start).format("DD MMM")} – ${dayjs(end).format("DD MMM YYYY")}`;
    case "month":
      return dayjs(start).format("MMMM YYYY");
    case "quarter": {
      const month = dayjs(start).month();
      const year = dayjs(start).format("YYYY");
      const quarters = ["Q1", "Q2", "Q3", "Q4"];
      return `${quarters[Math.floor(month / 3)]} ${year}`;
    }
    case "year":
      return dayjs(start).format("YYYY");
  }
}

export const useStatsFilter = create<StatsFilterState>((set, get) => {
  const initPeriod = "month";
  const initRange = getRange(initPeriod);

  return {
    period: initPeriod,
    type: "expense",
    startDate: initRange.start,
    endDate: initRange.end,
    setPeriod: (period) => {
      const range = getRange(period);
      set({ period, startDate: range.start, endDate: range.end });
    },
    setType: (type) => set({ type }),
    goNext: () => {
      const { period, startDate } = get();
      const unit = period === "quarter" ? "month" : period;
      const amount = period === "quarter" ? 3 : 1;
      const next = dayjs(startDate).add(amount, unit);
      const range = getRange(period, next);
      set({ startDate: range.start, endDate: range.end });
    },
    goPrev: () => {
      const { period, startDate } = get();
      const unit = period === "quarter" ? "month" : period;
      const amount = period === "quarter" ? 3 : 1;
      const prev = dayjs(startDate).subtract(amount, unit);
      const range = getRange(period, prev);
      set({ startDate: range.start, endDate: range.end });
    },
  };
});

export function getStatsPeriodLabel(
  period: StatsPeriod,
  startDate: string,
  endDate: string,
): string {
  return getLabel(period, startDate, endDate);
}
