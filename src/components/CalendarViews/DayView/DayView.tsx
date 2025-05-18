import { useCalendar } from "~/contexts/CalendarContext";
import { CalendarEvent } from "~/models/events";
import DayEventBox from "./DayEventBox";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { filterEventsForDate, groupOverlappingEvents } from "~/utils/calendar";
import { AnimatedLoader } from "~/components/AnimatedLoader";
import AddEventDialog from "../AddEventDialog";
import { EditEventSheet } from "../EditEventsheet";
import { ScrollArea } from "~/components/ui/scroll-area";

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
    const [currentTime, setCurrentTime] = useState(new Date());

    const [showEditEventSheet, setShowEditEventSheet] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

    const [placeholderEvent, setPlaceholderEvent] = useState<{
        top: number;
        time: Date | null;
    } | null>(null);

    const [hasScrolledForCurrentView, setHasScrolledForCurrentView] =
        useState(false);

    const totalHours = 24;
    const totalCalendarHeight = totalHours * hourHeight;

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

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timerId);
    }, []);

    // Effect to reset scroll flag when viewDate changes
    useEffect(() => {
        setHasScrolledForCurrentView(false);
    }, [viewDate]);

    const currentTimeLinePosition = useMemo(() => {
        const now = currentTime;

        const hours = now.getHours();
        const minutes = now.getMinutes();
        return (hours + minutes / 60) * hourHeight;
    }, [currentTime, hourHeight, viewDate]);

    // Effect to scroll to current time
    useEffect(() => {
        if (
            containerRef.current &&
            currentTimeLinePosition !== null &&
            !isLoading &&
            !hasScrolledForCurrentView
        ) {
            const viewport = containerRef.current.querySelector<HTMLDivElement>(
                "[data-radix-scroll-area-viewport]"
            );

            if (viewport) {
                const offset = hourHeight * 1.5; // Show 1.5 hours above the current time line
                let scrollToPosition = currentTimeLinePosition - offset;
                scrollToPosition = Math.max(0, scrollToPosition); // Don't scroll < 0

                // Ensure not to scroll beyond content
                const maxScrollTop =
                    viewport.scrollHeight - viewport.clientHeight;
                scrollToPosition = Math.min(scrollToPosition, maxScrollTop);

                // Use a timeout to ensure DOM is ready for scrolling
                const timerId = setTimeout(() => {
                    // Ensure viewport is still part of the containerRef's current DOM
                    if (
                        containerRef.current &&
                        containerRef.current.contains(viewport)
                    ) {
                        viewport.scrollTop = scrollToPosition;
                        setHasScrolledForCurrentView(true);
                    }
                }, 100);

                return () => clearTimeout(timerId);
            } else {
                console.warn(
                    "ScrollArea viewport not found for autoscrolling."
                );
            }
        }
    }, [
        viewDate, // Ensure effect considers viewDate changes via hasScrolledForCurrentView
        isLoading,
        currentTimeLinePosition,
        hourHeight,
        hasScrolledForCurrentView,
        // containerRef object is stable, its .current property is used inside.
    ]);

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

    const handleEventClick = useCallback(
        (eventId: number, event: React.MouseEvent) => {
            event.stopPropagation();
            const clickedEvent = events.find((ev) => ev.id === eventId);
            if (clickedEvent) {
                setEventToEdit(clickedEvent);
                setShowEditEventSheet(true);
                setShowEventForm(false); // Close add form if open
                setPlaceholderEvent(null); // Clear placeholder
            } else {
                console.error("Could not find event with ID:", eventId);
            }
        },
        [events]
    );

    // Memoize hour elements to prevent unnecessary re-renders
    const hourElements = useMemo(() => {
        return Array.from({ length: 24 }, (_, hour) => (
            <div
                key={hour}
                className="flex border-t border-gray-200 hour-row"
                style={{ height: `${hourHeight}px` }}
                onClick={(e) => handleCalendarClick(hour, e)}
            >
                <div className="w-20 py-3 text-right pr-4 text-black">
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
        <div className="bg-card border rounded-lg p-4 h-full shadow-md text-black flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-center">
                {viewDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                })}
            </h2>
            <ScrollArea ref={containerRef} className="relative flex-1 min-h-0">
                <div
                    className="relative"
                    style={{ height: `${totalCalendarHeight}px` }}
                >
                    {/* 1. Hour Rows (background grid + hour labels) */}
                    {hourElements}

                    {/* 2. Overlay for current time, events, placeholder. */}
                    <div className="absolute top-0 bottom-0 left-20 right-0 pointer-events-none">
                        {/* Current Time Indicator */}
                        {currentTimeLinePosition !== null && (
                            <div
                                className="absolute left-0 right-0 border-t-2 border-green-600 border-dashed"
                                style={{
                                    top: `${currentTimeLinePosition}px`,
                                    zIndex: 10,
                                }}
                            >
                                <div className="absolute -left-2 top-[-0.3rem] w-2 h-2 bg-green-600 rounded-full" />
                            </div>
                        )}

                        {/* Events and Placeholder (and Loader) */}
                        {isLoading ?
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                                <AnimatedLoader />
                            </div>
                        :   <>
                                <DayEventBox
                                    key={renderKey}
                                    events={filteredEvents}
                                    viewDate={viewDate}
                                    hourHeight={hourHeight}
                                    className="pointer-events-auto"
                                    onEventClick={handleEventClick}
                                />
                                {placeholderEventBox}
                            </>
                        }
                    </div>
                </div>
            </ScrollArea>
            <AddEventDialog
                isOpen={showEventForm}
                onClose={() => setShowEventForm(false)}
                position={{
                    x: dialogPosition.left,
                    y: dialogPosition.top,
                }}
                initialStart={popoverTime || viewDate}
            />
            <EditEventSheet
                open={showEditEventSheet}
                onOpenChange={setShowEditEventSheet}
                event={eventToEdit}
            />
        </div>
    );
}
