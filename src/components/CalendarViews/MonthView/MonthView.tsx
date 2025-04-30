import { useCalendar } from "~/contexts/CalendarContext";
import {
    filterEventsForDate,
    filterEventsForMonth,
    isSelected,
    isToday,
} from "~/utils/calendar";
import { CalendarEvent } from "~/models/events";
import CalendarBox from "./CalendarBox";
import { useState } from "react";
import AddEventDialog from "../AddEventDialog";
import { EditEventSheet } from "../EditEventsheet";

type MonthViewProps = {
    events: CalendarEvent[];
};
export default function MonthView({ events }: MonthViewProps) {
    const { viewDate, selectedDate, setSelectedDate } = useCalendar();
    const [showCreateEventDialog, setShowCreateEventDialog] = useState(false);
    const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const [showEditEventSheet, setShowEditEventSheet] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

    // Create calendar days array
    const calendarDays = [];

    // Add days from previous month to fill first week
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, daysInPrevMonth - i);
        calendarDays.push({ date, isCurrentMonth: false });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        calendarDays.push({ date, isCurrentMonth: true });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i);
        calendarDays.push({ date, isCurrentMonth: false });
    }

    const handleDateClick = (date: Date, event: React.MouseEvent) => {
        // Check if an event element was clicked using the closest() method
        const eventElement = (event.target as HTMLElement).closest(
            "[data-event-id], .calendar-event"
        );

        // Only show dialog if we didn't click on an event
        if (!eventElement) {
            setSelectedDate(date);
            setDialogPosition({
                x: event.clientX + 20,
                y: event.clientY - 10,
            });
            setShowCreateEventDialog(true);
        }
    };

    const handleEventClick = (eventId: number, event: React.MouseEvent) => {
        console.log("clicked");
        event.stopPropagation();
        const clickedEvent = events.find((ev) => ev.id === eventId);
        console.log("Clicked event:", clickedEvent);
        if (clickedEvent) {
            setEventToEdit(clickedEvent);
            setShowEditEventSheet(true);
        } else {
            console.error("Could not find event with ID:", eventId);
        }
    };

    return (
        <div className="p-4">
            <div className="border rounded-lg p-4">
                <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                            <div
                                key={day}
                                className="p-2 text-center rounded-md font-semibold bg-gray-100"
                            >
                                {day}
                            </div>
                        )
                    )}
                    {calendarDays.map((dayInfo, index) => (
                        <CalendarBox
                            key={index}
                            dayInfo={dayInfo}
                            index={index}
                            onEventClick={handleEventClick}
                            onDateClick={handleDateClick}
                            isToday={isToday}
                            isSelected={isSelected}
                            events={filterEventsForDate(dayInfo.date, events)}
                        />
                    ))}
                </div>
            </div>
            {showCreateEventDialog && (
                <AddEventDialog
                    initialStart={selectedDate}
                    isOpen={showCreateEventDialog}
                    position={dialogPosition}
                    onClose={() => setShowCreateEventDialog(false)}
                ></AddEventDialog>
            )}
            <EditEventSheet
                open={showEditEventSheet}
                onOpenChange={setShowEditEventSheet}
                event={eventToEdit}
            />
        </div>
    );
}
