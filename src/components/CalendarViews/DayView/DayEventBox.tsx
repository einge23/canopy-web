import { CalendarEvent } from "~/models/events";
import { useMemo } from "react";
import { adjustColor } from "~/lib/random-helpers";
import { groupOverlappingEvents } from "~/utils/calendar";

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

        // Sort events by start time first
        const sortedEvents = [...events].sort(
            (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime()
        );

        // Group overlapping events
        const eventGroups = groupOverlappingEvents(sortedEvents);

        // Calculate positions for each event, considering overlaps
        const positionedEvents: Array<{
            event: CalendarEvent;
            topPixels: number;
            heightPixels: number;
            startTime: Date;
            endTime: Date;
            leftPercent: number;
            widthPercent: number;
        }> = [];

        eventGroups.forEach((group) => {
            const groupSize = group.length;
            const eventWidthPercent = 100 / groupSize; // Divide width among overlapping events

            // Sort events within the group by start time to maintain consistent horizontal order
            group.sort(
                (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime()
            );

            group.forEach((event, indexInGroup) => {
                const { effectiveStart, effectiveEnd } =
                    getEventBoundariesForDay(event, viewDate);

                const startHour = effectiveStart.getHours();
                const startMinute = effectiveStart.getMinutes();
                const endHour = effectiveEnd.getHours();
                const endMinute = effectiveEnd.getMinutes();

                const topPixels = (startHour + startMinute / 60) * hourHeight;
                const durationHours =
                    endHour - startHour + (endMinute - startMinute) / 60;
                const heightPixels = Math.max(durationHours * hourHeight, 24); // Min height

                const leftPercent = indexInGroup * eventWidthPercent;

                positionedEvents.push({
                    event,
                    topPixels,
                    heightPixels,
                    startTime: effectiveStart,
                    endTime: effectiveEnd,
                    leftPercent,
                    widthPercent: eventWidthPercent,
                });
            });
        });

        return positionedEvents;
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
                ({
                    event,
                    topPixels,
                    heightPixels,
                    startTime,
                    endTime,
                    leftPercent,
                    widthPercent,
                }) => (
                    <div
                        key={event.id}
                        data-event-id={event.id} // Add data attribute for easier targeting
                        className="absolute hover:cursor-pointer rounded-md px-2 py-1 overflow-hidden hover:brightness-90 transition-all shadow-sm calendar-event" // Add class
                        style={{
                            top: `${topPixels}px`,
                            height: `${heightPixels}px`,
                            left: `${leftPercent}%`, // Use percentage for left position
                            width: `calc(${widthPercent}% - 4px)`, // Use percentage for width, subtract margin/padding
                            background: `linear-gradient(to bottom, ${event.color}, ${adjustColor(event.color, -20)})`,
                            zIndex: 10,
                            marginLeft: "2px", // Add small margin between overlapping events
                            marginRight: "2px",
                        }}
                        onClick={(e) => handleEventClick(e, event.id)}
                    >
                        <div className="text-md font-bold truncate mb-1">
                            {" "}
                            {event.name}
                        </div>
                        <div className="text-xs font-medium flex-row flex gap-2 items-center">
                            {formatTime(startTime)} - {formatTime(endTime)}
                            {event.location && (
                                <p className=" truncate">{event.location}</p>
                            )}
                        </div>
                        {heightPixels > 70 && widthPercent > 30 && (
                            <>
                                <div>
                                    {event.description && (
                                        <p className="mt-1 truncate text-sm">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
