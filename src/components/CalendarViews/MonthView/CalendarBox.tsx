import { useCalendar } from "~/contexts/CalendarContext";
import { adjustColor } from "~/lib/random-helpers";
import { CalendarEvent } from "~/models/events";
import { DayInfo } from "~/routes/_authed/calendar";

interface CalendarBoxProps {
    dayInfo: DayInfo;
    index: number;
    onDateClick: (date: Date, event: React.MouseEvent) => void;
    onEventClick?: (eventId: number, event: React.MouseEvent) => void;
    isToday: (date: Date) => boolean;
    isSelected: (date: Date, selectedDate: Date) => boolean;
    events: CalendarEvent[];
}

export default function CalendarBox({
    dayInfo,
    index,
    onDateClick,
    onEventClick,
    isToday,
    isSelected,
    events,
}: CalendarBoxProps) {
    const { selectedDate } = useCalendar();

    const visibleEvents = events.slice(0, 2);
    const remainingCount = Math.max(0, events.length - 2);

    const handleClick = (event: React.MouseEvent) => {
        onDateClick(dayInfo.date, event);
    };

    const handleEventClick = (event: React.MouseEvent, eventId: number) => {
        event.stopPropagation();
        if (onEventClick) {
            onEventClick(eventId, event);
        }
    };

    return (
        <div
            key={index}
            onClick={handleClick}
            className={`p-2 border rounded min-h-24 cursor-pointer  ${
                !dayInfo.isCurrentMonth ? "bg-teal text-gray-100"
                : isSelected(dayInfo.date, selectedDate) ?
                    " bg-sage  border-2 border-teal"
                : isToday(dayInfo.date) ? "bg-teal/50 border-gray-100"
                : ""
            }`}
        >
            <div className="text-right">{dayInfo.date.getDate()}</div>
            {visibleEvents.map((event) => (
                <div
                    key={event.id}
                    className="calendar-event w-full h-5 hover:brightness-90 rounded-md text-xs mb-1 px-1 overflow-hidden text-ellipsis whitespace-nowrap flex items-center"
                    data-event-id={event.id}
                    onClick={(e) => handleEventClick(e, event.id)}
                    style={{
                        background: `linear-gradient(to bottom, ${event.color}, ${adjustColor(event.color, -20)})`,
                    }}
                >
                    {event.name}
                </div>
            ))}

            {remainingCount > 0 && (
                <div
                    className="calendar-event w-full h-5 hover:brightness-90 rounded-md text-xs mb-1 px-1 bg-background text-gray-700 flex items-center justify-center font-medium"
                    onClick={(e) => e.stopPropagation()} // Just stop propagation for the "more" indicator
                >
                    + {remainingCount} more
                </div>
            )}
        </div>
    );
}
