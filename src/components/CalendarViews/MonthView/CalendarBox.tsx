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

    // Adjust visible events based on screen size if needed, though 2 might be fine.
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
            className={`p-1 md:p-2 h-full border rounded cursor-pointer overflow-hidden flex flex-col ${
                !dayInfo.isCurrentMonth ? "bg-teal text-gray-100"
                : isSelected(dayInfo.date, selectedDate) ?
                    " bg-sage  border-2 border-teal"
                : isToday(dayInfo.date) ? "bg-teal/50 border-gray-100"
                : ""
            }`}
        >
            {/* Use responsive text size */}
            <div className="text-right text-xs md:text-sm mb-1">
                {dayInfo.date.getDate()}
            </div>
            <div className="flex-grow space-y-1">
                {" "}
                {/* Allow events to fill remaining space */}
                {visibleEvents.map((event) => (
                    <div
                        key={event.id}
                        // Use responsive height and text size
                        className="calendar-event w-full h-6 md:h-6 sm:h-5 hover:brightness-90 rounded-md text-[10px] md:text-xs px-1 overflow-hidden text-ellipsis whitespace-nowrap flex items-center"
                        data-event-id={event.id}
                        onClick={(e) => handleEventClick(e, event.id)}
                        style={{
                            background: `linear-gradient(to bottom, ${event.color}, ${adjustColor(event.color, -20)})`,
                        }}
                    >
                        {event.name}
                    </div>
                ))}
            </div>
            {remainingCount > 0 && (
                <div
                    // Use responsive height and text size
                    className="calendar-event w-full h-5 md:h-6 hover:brightness-90 rounded-md text-[10px] md:text-xs mt-1 px-1 bg-background text-gray-700 flex items-center justify-center font-medium flex-shrink-0" // Prevent shrinking
                    onClick={(e) => e.stopPropagation()} // Just stop propagation for the "more" indicator
                >
                    + {remainingCount} more
                </div>
            )}
        </div>
    );
}
