import { useCalendar } from "~/contexts/CalendarContext";
import { CalendarEvent } from "~/models/events";
import DayEventBox from "./DayEventBox";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterEventsForDate } from "~/utils/calendar";
import { AnimatedLoader } from "~/components/AnimatedLoader";
import AddEventDialog from "../AddEventDialog";

type DayViewProps = {
    events: CalendarEvent[];
    isLoading?: boolean;
};

export default function DayView({ events, isLoading = false }: DayViewProps) {
    const { viewDate, setSelectedDate } = useCalendar();
    const containerRef = useRef<HTMLDivElement>(null);
    const [hourHeight, setHourHeight] = useState(58);
    const [renderKey, setRenderKey] = useState(0);
    const [showEventForm, setShowEventForm] = useState(false);
    const [popoverTime, setPopoverTime] = useState<Date | null>(null);
    const [dialogPosition, setDialogPosition] = useState({ left: 0, top: 0 });

    const [placeholderEvent, setPlaceholderEvent] = useState<{
        top: number;
        time: Date | null;
    } | null>(null);

    // Memoize filtered events to prevent unnecessary recalculation
    const filteredEvents = useMemo(
        () => filterEventsForDate(viewDate, events),
        [viewDate, events]
    );

    // Update renderKey only when dependencies change
    useEffect(() => {
        setRenderKey((prev) => prev + 1);
    }, [viewDate, events]);

    // Close dialog when clicking outside
    useEffect(() => {
        if (!showEventForm) return;

        const handleClickOutside = (e: MouseEvent) => {
            const dialog = document.getElementById("event-form-dialog");
            if (dialog && !dialog.contains(e.target as Node)) {
                setShowEventForm(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEventForm]);

    // Memoize the calendar click handler
    const handleCalendarClick = useCallback(
        (hour: number, event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation(); // Prevent event bubbling

            // Check if we clicked on an existing event
            // Look for elements with class 'calendar-event' or data-event-id attribute
            let target = event.target as HTMLElement;
            let isExistingEvent = false;

            while (target && target !== event.currentTarget) {
                if (
                    target.classList.contains("calendar-event") ||
                    target.hasAttribute("data-event-id")
                ) {
                    isExistingEvent = true;
                    break;
                }
                target = target.parentElement as HTMLElement;
            }

            // Don't show dialog if clicking on existing event
            if (isExistingEvent) {
                return;
            }

            const rect = event.currentTarget.getBoundingClientRect();
            const relativeY = event.clientY - rect.top;

            // Calculate minutes based on position within the hour box
            const minuteRatio = relativeY / hourHeight;
            let minutes = Math.floor(minuteRatio * 60);
            minutes = Math.round(minutes / 15) * 15;

            const newDate = new Date(viewDate);
            newDate.setHours(hour, minutes, 0, 0);
            setSelectedDate(newDate);
            setPopoverTime(newDate);

            // Calculate top position for placeholder event
            const topPosition = (hour + minutes / 60) * hourHeight;

            // Position dialog near the click
            setDialogPosition({
                left: event.clientX + 30,
                top: event.clientY - 20,
            });

            // Update placeholder event
            setPlaceholderEvent({
                top: topPosition,
                time: newDate,
            });

            setShowEventForm(true);
        },
        [hourHeight, viewDate, setSelectedDate]
    );

    // Clear placeholder when form is closed
    useEffect(() => {
        if (!showEventForm) {
            // Add a small delay to prevent flickering
            const timer = setTimeout(() => {
                setPlaceholderEvent(null);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [showEventForm]);

    // Placeholder event visualization
    const placeholderEventBox = useMemo(() => {
        if (!placeholderEvent || !placeholderEvent.time) return null;

        const formattedTime = placeholderEvent.time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

        return (
            <div
                className="absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden border-2 border-dashed border-primary bg-primary/10 pointer-events-none"
                style={{
                    top: `${placeholderEvent.top}px`,
                    height: `${hourHeight}px`,
                    zIndex: 5,
                }}
            >
                <div className="text-sm font-semibold text-primary truncate">
                    New Event
                </div>
                <div className="text-xs font-medium text-primary/80">
                    {formattedTime}
                </div>
            </div>
        );
    }, [placeholderEvent, hourHeight]);

    // Memoize hour elements to prevent unnecessary re-renders
    const hourElements = useMemo(() => {
        return Array.from({ length: 24 }, (_, hour) => (
            <div
                key={hour}
                className="flex border-t border-gray-200 hour-row"
                style={{ height: `${hourHeight}px` }}
                onClick={(e) => handleCalendarClick(hour, e)}
            >
                <div className="w-20 py-3 text-right pr-4 text-gray-500">
                    {hour === 0 ?
                        "12 AM"
                    : hour < 12 ?
                        `${hour} AM`
                    : hour === 12 ?
                        "12 PM"
                    :   `${hour - 12} PM`}
                </div>
                <div className="flex-1" style={{ height: `${hourHeight}px` }} />
            </div>
        ));
    }, [hourHeight, handleCalendarClick]);

    return (
        <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-center">
                {viewDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })}
            </h2>
            <div
                ref={containerRef}
                className="overflow-y-auto max-h-[600px] relative"
            >
                {hourElements}
                <div className="absolute top-0 left-20 w-[90%] bottom-0 pointer-events-none">
                    {isLoading ?
                        <AnimatedLoader className="pointer-events-auto" />
                    :   <>
                            <DayEventBox
                                key={renderKey}
                                events={filteredEvents}
                                viewDate={viewDate}
                                hourHeight={hourHeight}
                                className="pointer-events-auto"
                            />
                            {placeholderEventBox}
                        </>
                    }
                </div>

                {showEventForm && (
                    <AddEventDialog
                        isOpen={showEventForm}
                        onClose={() => setShowEventForm(false)}
                        position={{
                            x: dialogPosition.left,
                            y: dialogPosition.top,
                        }}
                        initialStart={popoverTime || viewDate}
                    />
                )}
            </div>
        </div>
    );
}
