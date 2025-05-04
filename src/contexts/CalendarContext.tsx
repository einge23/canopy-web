import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Route } from "~/routes/_authed/calendar";
import { Months } from "~/utils/calendar";

interface CalendarContextType {
    viewDate: Date;
    selectedDate: Date;
    viewType: CalendarViewType;
    setViewDate: (date: Date) => void;
    setSelectedDate: (date: Date) => void;
    setViewType: (type: CalendarViewType) => void;
    prevMonth: () => void;
    nextMonth: () => void;
    prevWeek: () => void;
    nextWeek: () => void;
    prevDay: () => void;
    nextDay: () => void;
    formatViewDate: () => string;
}

export type CalendarViewType = "month" | "week" | "day";

const CalendarContext = createContext<CalendarContextType | undefined>(
    undefined
);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
    const currentDate = new Date();
    const [viewDate, setViewDate] = useState(new Date(currentDate));
    const [selectedDate, setSelectedDate] = useState<Date>(currentDate);

    const navigate = useNavigate();
    const [viewType, setViewType] = useState<CalendarViewType>("month");
    const routerState = useRouterState();

    useEffect(() => {
        const searchParams = new URLSearchParams(routerState.location.search);
        const searchViewType = searchParams.get(
            "viewType"
        ) as CalendarViewType | null;

        if (
            searchViewType &&
            ["day", "week", "month"].includes(searchViewType)
        ) {
            if (searchViewType !== viewType) {
                setViewType(searchViewType);
            }
        }
    }, [routerState.location.search, viewType]);

    const handleSetViewType = (type: CalendarViewType) => {
        setViewType(type);
        navigate({
            to: "/calendar",
            search: (prev) => ({
                ...prev,
                viewType: type,
            }),
            replace: true,
        });
    };

    const prevMonth = () => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setViewDate(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setViewDate(newDate);
    };

    const prevWeek = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(newDate.getDate() - 7);
        setViewDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(newDate.getDate() + 7);
        setViewDate(newDate);
    };

    const prevDay = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(newDate.getDate() - 1);
        setViewDate(newDate);
        setSelectedDate(new Date(newDate));
    };

    const nextDay = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(newDate.getDate() + 1);
        setViewDate(newDate);
        setSelectedDate(new Date(newDate));
    };

    const formatViewDate = () => {
        const month = Months[viewDate.getMonth()].name;
        const year = viewDate.getFullYear();
        const date = viewDate.getDate();

        if (viewType === "month") {
            return `${month} ${year}`;
        } else if (viewType === "week") {
            // Get start and end of week
            const startOfWeek = new Date(viewDate);
            startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const startMonth = Months[startOfWeek.getMonth()].name;
            const endMonth = Months[endOfWeek.getMonth()].name;

            if (startMonth === endMonth) {
                return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`;
            } else {
                return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${year}`;
            }
        } else {
            // Day view
            const day = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ][viewDate.getDay()];
            return `${day}, ${month} ${date}, ${year}`;
        }
    };

    return (
        <CalendarContext.Provider
            value={{
                viewDate,
                selectedDate,
                viewType,
                setViewDate,
                setSelectedDate,
                setViewType: handleSetViewType,
                prevMonth,
                nextMonth,
                prevWeek,
                nextWeek,
                prevDay,
                nextDay,
                formatViewDate,
            }}
        >
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendar() {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error("useCalendar must be used within a CalendarProvider");
    }
    return context;
}
