import { createFileRoute } from "@tanstack/react-router";
import { useCalendar } from "~/contexts/CalendarContext";
import MonthView from "~/components/CalendarViews/MonthView/MonthView";
import WeekView from "~/components/CalendarViews/WeekView";
import DayView from "~/components/CalendarViews/DayView/DayView";
import { SignIn } from "@clerk/tanstack-start";
import { AnimatedLoader } from "~/components/AnimatedLoader";
import { useQuery } from "@tanstack/react-query";
import {
    filterEventsForDate,
    filterEventsForMonth,
    getMonthlyEvents,
} from "~/utils/calendar";
import { useMemo } from "react";
export type DayInfo = {
    date: Date;
    isCurrentMonth: boolean;
};

export const Route = createFileRoute("/_authed/calendar")({
    beforeLoad: ({ context }) => {
        if (!context.userId) {
            throw new Error("Not authenticated");
        }
    },
    errorComponent: ({ error }) => {
        if (error.message === "Not authenticated") {
            return (
                <div className="flex items-center justify-center p-12">
                    <SignIn
                        routing="hash"
                        forceRedirectUrl={window.location.href}
                    />
                </div>
            );
        }

        throw error;
    },
    component: CalendarComponent,
});

function CalendarComponent() {
    const { viewType, viewDate, selectedDate } = useCalendar();

    // Use viewDate instead of selectedDate for consistency
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const {
        data: events = [],
        isLoading,
        isError,
        error,
        refetch: refetchEvents,
    } = useQuery({
        queryKey: ["events", "monthly", currentYear, currentMonth],
        // Fix: Pass the object directly, not as named properties
        queryFn: () => getMonthlyEvents(),
    });

    const dailyEvents = useMemo(
        () => filterEventsForDate(selectedDate, events),
        [selectedDate, events]
    );

    console.log(dailyEvents);

    const monthEvents = useMemo(
        () => filterEventsForMonth(events, currentMonth, currentYear),
        [events, currentMonth, currentYear]
    );

    console.log("month Events", monthEvents);
    console.log("events", events);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <AnimatedLoader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-red-500 p-4">
                Error loading events: {error?.message}
            </div>
        );
    }

    // Render the appropriate view based on viewType
    return (
        <div className="p-4">
            {viewType === "month" && <MonthView events={monthEvents} />}
            {viewType === "week" && <WeekView />}
            {viewType === "day" && <DayView events={dailyEvents} />}
        </div>
    );
}
