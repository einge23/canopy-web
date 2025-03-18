import { createFileRoute } from "@tanstack/react-router";
import { useCalendar } from "~/contexts/CalendarContext";
import MonthView from "~/components/CalendarViews/MonthView";
import WeekView from "~/components/CalendarViews/WeekView";
import DayView from "~/components/CalendarViews/DayView";
import { SignIn } from "@clerk/tanstack-start";
import { useMonthlyEvents } from "~/hooks/UseMonthlyEvents";
import { AnimatedLoader } from "~/components/AnimatedLoader";
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
    const { viewType, viewDate, selectedDate, setSelectedDate } = useCalendar();

    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    const {
        data: events,
        isLoading,
        isError,
        error,
        refetch: refetchEvents,
    } = useMonthlyEvents(selectedMonth, selectedYear);

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
            {viewType === "month" && <MonthView />}
            {viewType === "week" && <WeekView />}
            {viewType === "day" && <DayView />}
        </div>
    );
}
