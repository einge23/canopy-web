import { useCalendar } from "~/contexts/CalendarContext";

export default function DayView() {
    const { viewDate, selectedDate, setSelectedDate } = useCalendar();

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const formattedDate = viewDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-center">
                {formattedDate}
            </h2>
            <div className="overflow-y-auto max-h-[600px]">
                {hours.map((hour) => (
                    <div key={hour} className="flex border-t border-gray-200">
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
                            className="flex-1 h-16 relative cursor-pointer hover:bg-gray-50"
                            onClick={() => {
                                const newDate = new Date(viewDate);
                                newDate.setHours(hour);
                                setSelectedDate(newDate);
                            }}
                        >
                            {/* Event placeholders would go here */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
