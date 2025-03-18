import { useCalendar } from "~/contexts/CalendarContext";
import { DayInfo } from "~/routes/_authed/calendar";

interface CalendarBoxProps {
    dayInfo: DayInfo;
    index: number;
    onDateClick: (date: Date) => void;
    isToday: (date: Date) => boolean;
    isSelected: (date: Date, selectedDate: Date) => boolean;
}

export default function CalendarBox({
    dayInfo,
    index,
    onDateClick,
    isToday,
    isSelected,
}: CalendarBoxProps) {
    const { selectedDate } = useCalendar();

    return (
        <div
            key={index}
            onClick={() => onDateClick(dayInfo.date)}
            className={`p-2 border rounded min-h-24 cursor-pointer  ${
                !dayInfo.isCurrentMonth ? "bg-teal text-gray-100"
                : isSelected(dayInfo.date, selectedDate) ?
                    "bg-green-100 border-sage"
                : isToday(dayInfo.date) ? "bg-teal/50 border-gray-100"
                : ""
            }`}
        >
            <div className="text-right">{dayInfo.date.getDate()}</div>
            {/* You might want to replace this with your CalendarBox component */}
        </div>
    );
}
