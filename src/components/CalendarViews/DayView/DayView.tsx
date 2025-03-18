import { useCalendar } from "~/contexts/CalendarContext";
import { CalendarEvent } from "~/models/events";
import DayEventBox from "./DayEventBox";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { filterEventsForDate } from "~/utils/calendar";
import { AnimatedLoader } from "~/components/AnimatedLoader";

type DayViewProps = {
    events: CalendarEvent[];
    isLoading?: boolean;
};

export default function DayView({ events, isLoading = false }: DayViewProps) {
    const { viewDate, selectedDate, setSelectedDate } = useCalendar();
    const containerRef = useRef<HTMLDivElement>(null);
    const [hourHeight, setHourHeight] = useState(58);
    const [renderKey, setRenderKey] = useState(0); // Force re-render key

    // Use viewDate for displaying events, not selectedDate
    const filteredEvents = filterEventsForDate(viewDate, events);

    // Use useEffect to ensure events are properly rendered on date change
    useEffect(() => {
        // Force a re-render when viewDate or events change
        setRenderKey((prev) => prev + 1);
    }, [viewDate, events]);

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
                {Array.from({ length: 24 }, (_, hour) => (
                    <div
                        key={hour}
                        className="flex border-t border-gray-200 hour-row"
                        style={{ height: `${hourHeight}px` }} // Explicitly set hour height
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
                        <div
                            className="flex-1"
                            style={{ height: `${hourHeight}px` }} // Set height explicitly here too
                            onClick={() => {
                                const newDate = new Date(viewDate);
                                newDate.setHours(hour);
                                setSelectedDate(newDate);
                            }}
                        ></div>
                    </div>
                ))}

                <div className="absolute top-0 left-20 w-[90%] bottom-0">
                    {isLoading ?
                        <AnimatedLoader />
                    :   <DayEventBox
                            key={renderKey} // Force re-render when this changes
                            events={filteredEvents}
                            viewDate={viewDate}
                            hourHeight={hourHeight}
                        />
                    }
                </div>
            </div>
        </div>
    );
}
