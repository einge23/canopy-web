import { Fragment } from "react/jsx-runtime";
import { useCalendar } from "~/contexts/CalendarContext";
import {
    getCurrentTimeIndicatorStyles,
    isSelected,
    isToday,
} from "~/utils/calendar";

export default function WeekView() {
    const { viewDate, selectedDate, setSelectedDate } = useCalendar();

    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(viewDate);
    startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());

    // Create an array of the 7 days of the week
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        weekDays.push(date);
    }

    const getDateClasses = (date: Date) => {
        return `border rounded-full ${
            isSelected(date, selectedDate) ? "bg-green-100 border-sage"
            : isToday(date) ? "bg-teal/50 border-gray-100"
            : ""
        }`;
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <div className="border rounded-lg p-4">
            <div className="flex">
                {/* Empty cell for the corner where time labels start */}
                <div className="w-16 flex-shrink-0"></div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0 flex-grow">
                    {weekDays.map((date, index) => (
                        <div key={index} className="text-center px-1">
                            <div className="p-2 font-semibold bg-gray-100 rounded-md">
                                {
                                    [
                                        "Sun",
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                    ][date.getDay()]
                                }
                            </div>
                            <div
                                className={`mt-1 p-2 font-medium cursor-pointer ${getDateClasses(date)}`}
                                onClick={() => handleDateClick(date)}
                            >
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time slots */}
            <div className="flex mt-2">
                {/* Time labels column */}
                <div className="w-16 flex-shrink-0">
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <div
                            key={hour}
                            className="h-12 text-right pr-2 text-xs text-gray-500"
                        >
                            {hour === 0 ?
                                "12 AM"
                            : hour < 12 ?
                                `${hour} AM`
                            : hour === 12 ?
                                "12 PM"
                            :   `${hour - 12} PM`}
                        </div>
                    ))}
                </div>

                {/* Day columns with time slots */}
                <div className="grid grid-cols-7 gap-0 flex-grow">
                    {weekDays.map((date, dayIndex) => (
                        <div
                            key={dayIndex}
                            className="border-l border-gray-200 first:border-l-0 relative"
                        >
                            {/* Current time indicator */}
                            {isToday(date) && (
                                <div
                                    className="absolute w-[calc(100%+4px)] -left-[1px] z-10"
                                    style={getCurrentTimeIndicatorStyles(date)}
                                >
                                    <div className="relative flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <div className="h-[2px] w-full bg-green-500"></div>
                                    </div>
                                </div>
                            )}

                            {/* Time slots */}
                            {Array.from({ length: 24 }, (_, i) => i).map(
                                (hour) => (
                                    <div
                                        key={`${dayIndex}-${hour}`}
                                        className="h-12 border-t border-gray-200 relative hover:bg-gray-50"
                                        onClick={() => {
                                            const newDate = new Date(date);
                                            newDate.setHours(hour);
                                            handleDateClick(newDate);
                                        }}
                                    >
                                        {/* Event placeholders would go here */}
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
