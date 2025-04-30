import { CalendarEvent } from "~/models/events";
import { useMemo } from "react";
import { adjustColor } from "~/lib/random-helpers";

type DayEventBoxProps = {
    events: CalendarEvent[];
    hourHeight: number;
    viewDate: Date;
    className?: string;
    onEventClick?: (eventId: number, event: React.MouseEvent) => void;
};

export default function DayEventBox({
    events,
    hourHeight,
    viewDate,
    className = "",
    onEventClick,
}: DayEventBoxProps) {
    // Calculate event positions for the day
    const eventsWithPositions = useMemo(() => {
        // Function to get event boundaries within current day
        const getEventBoundariesForDay = (event: CalendarEvent, date: Date) => {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);

            // Create date objects for start and end of current day
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            // Clamp start and end times to the current day
            const effectiveStart = startTime < dayStart ? dayStart : startTime;
            const effectiveEnd = endTime > dayEnd ? dayEnd : endTime;

            return { effectiveStart, effectiveEnd };
        };

        // Sort events by start time
        const sortedEvents = [...events].sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        );

        // Map events to their display properties
        return sortedEvents.map((event, index) => {
            const { effectiveStart, effectiveEnd } = getEventBoundariesForDay(
                event,
                viewDate
            );

            // Get hours and minutes
            const startHour = effectiveStart.getHours();
            const startMinute = effectiveStart.getMinutes();
            const endHour = effectiveEnd.getHours();
            const endMinute = effectiveEnd.getMinutes();

            // Calculate position and height
            const topPixels = (startHour + startMinute / 60) * hourHeight;
            const durationHours =
                endHour - startHour + (endMinute - startMinute) / 60;
            const heightPixels = Math.max(durationHours * hourHeight, 24);

            return {
                event,
                topPixels,
                heightPixels,
                startTime: effectiveStart,
                endTime: effectiveEnd,
            };
        });
    }, [events, viewDate, hourHeight]);

    // Format time display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const handleEventClick = (e: React.MouseEvent, eventId: number) => {
        if (onEventClick) {
            onEventClick(eventId, e);
        }
    };

    return (
        <div className={className}>
            {eventsWithPositions.map(
                ({ event, topPixels, heightPixels, startTime, endTime }) => (
                    <div
                        key={event.id}
                        className="absolute hover:cursor-pointer left-1 right-1 rounded-md px-2 py-1 overflow-hidden hover:brightness-90 transition-all shadow-sm"
                        style={{
                            top: `${topPixels}px`,
                            height: `${heightPixels}px`,
                            background: `linear-gradient(to bottom, ${event.color}, ${adjustColor(event.color, -20)})`,
                            zIndex: 10,
                        }}
                        onClick={(e) => handleEventClick(e, event.id)}
                    >
                        <div className="text-sm font-semibold text-white truncate">
                            {event.name}
                        </div>
                        {heightPixels > 32 && (
                            <div className="text-xs font-medium text-white">
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
