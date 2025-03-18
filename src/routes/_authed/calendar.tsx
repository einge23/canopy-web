import { createFileRoute } from "@tanstack/react-router";
import CalendarBox from "~/components/CalendarBox";
import React from "react";
import { useCalendar } from "~/contexts/CalendarContext";
import MonthView from "~/components/CalendarViews/MonthView";
import WeekView from "~/components/CalendarViews/WeekView";
import DayView from "~/components/CalendarViews/DayView";

export type DayInfo = {
    date: Date;
    isCurrentMonth: boolean;
};

export const Route = createFileRoute("/_authed/calendar")({
    component: CalendarComponent,
});

function CalendarComponent() {
    const { viewType, viewDate, selectedDate, setSelectedDate } = useCalendar();

    // Render the appropriate view based on viewType
    return (
        <div className="p-4">
            {viewType === "month" && <MonthView />}
            {viewType === "week" && <WeekView />}
            {viewType === "day" && <DayView />}
        </div>
    );
}
