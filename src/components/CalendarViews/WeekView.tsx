import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useCalendar } from "~/contexts/CalendarContext";
import { CalendarEvent } from "~/models/events";
import AddEventDialog from "./AddEventDialog";
import { EditEventSheet } from "./EditEventsheet";
import {
    filterEventsForDate,
    getCurrentTimeIndicatorStyles,
    groupOverlappingEvents,
    isSelected,
    isToday,
} from "~/utils/calendar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { adjustColor } from "~/lib/random-helpers";

// Define props
type WeekViewProps = {
    events: CalendarEvent[];
    isLoading?: boolean;
};

export default function WeekView({ events, isLoading = false }: WeekViewProps) {
    const { viewDate, selectedDate, setSelectedDate } = useCalendar();
    const hourHeight = 48; // Corresponds to h-12 in Tailwind (12 * 4px = 48px)

    // State for dialogs and sheets
    const [showAddEventDialog, setShowAddEventDialog] = useState(false);
    const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
    const [popoverTime, setPopoverTime] = useState<Date | null>(null);

    const [showEditEventSheet, setShowEditEventSheet] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

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
            isSelected(date, selectedDate) ?
                "bg-green-100 border-sage dark:bg-green-700 dark:border-green-500"
            : isToday(date) ?
                "bg-teal/50 border-gray-100 dark:bg-teal-700/50 dark:border-teal-600"
            :   "border-gray-300 dark:border-slate-500"
        }`;
    };

    const handleDateHeaderClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleSlotClick = useCallback(
        (
            date: Date,
            hour: number,
            clickEvent: React.MouseEvent<HTMLDivElement>
        ) => {
            let target = clickEvent.target as HTMLElement;
            while (target && target !== clickEvent.currentTarget) {
                if (target.hasAttribute("data-event-id")) {
                    return; // Click was on an event, not an empty slot
                }
                target = target.parentElement as HTMLElement;
            }

            const newSelectedDate = new Date(date);
            newSelectedDate.setHours(hour, 0, 0, 0);
            setSelectedDate(newSelectedDate);
            setPopoverTime(newSelectedDate);

            const DIALOG_WIDTH_ESTIMATE = 400;
            const DIALOG_HEIGHT_ESTIMATE = 500;
            const PADDING = 20;
            const clickX = clickEvent.clientX;
            const clickY = clickEvent.clientY;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let finalX = clickX + PADDING;
            let finalY = clickY + PADDING;

            if (finalX + DIALOG_WIDTH_ESTIMATE > viewportWidth) {
                finalX = clickX - DIALOG_WIDTH_ESTIMATE - PADDING;
            }
            if (finalX < PADDING) finalX = PADDING;

            if (finalY + DIALOG_HEIGHT_ESTIMATE > viewportHeight) {
                finalY = clickY - DIALOG_HEIGHT_ESTIMATE - PADDING;
            }
            if (finalY < PADDING) finalY = PADDING;

            setDialogPosition({ x: finalX, y: finalY });
            setShowAddEventDialog(true);
            setEventToEdit(null);
            setShowEditEventSheet(false);
        },
        [setSelectedDate]
    );

    const handleEventClick = useCallback(
        (clickedEvent: CalendarEvent, domEvent: React.MouseEvent) => {
            domEvent.stopPropagation();
            setEventToEdit(clickedEvent);
            setShowEditEventSheet(true);
            setShowAddEventDialog(false);
        },
        [] // No dependencies needed as clickedEvent is passed directly
    );

    return (
        <div className="bg-card border dark:border-slate-700 rounded-lg p-4 shadow-md flex flex-col h-full text-slate-800 dark:text-white">
            {/* Header part (Day names and dates) */}
            <div className="flex flex-shrink-0">
                <div className="w-16 flex-shrink-0"></div> {/* Empty corner */}
                <div className="grid grid-cols-7 gap-0 flex-grow">
                    {weekDays.map((date, index) => (
                        <div key={index} className="text-center px-1">
                            <div className="p-2 font-semibold bg-card text-navy rounded-md">
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
                                className={`mt-1 p-2 font-medium cursor-pointer text-navy ${getDateClasses(date)}`}
                                onClick={() => handleDateHeaderClick(date)}
                            >
                                {date.getDate()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scrollable Body part (Time labels + Day grid) */}
            <ScrollArea className="flex-grow min-h-0 mt-2 relative">
                <div
                    className="flex relative"
                    style={{ height: `${24 * hourHeight}px` }}
                >
                    {/* Time labels column (now inside scrollable content) */}
                    <div className="w-16 flex-shrink-0 pr-2 text-xs text-gray-500 dark:text-gray-400">
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <div
                                key={hour}
                                className="text-right"
                                style={{ height: `${hourHeight}px` }}
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

                    {/* Day Columns Area (now inside scrollable content, alongside time labels) */}
                    <div className="grid grid-cols-7 gap-0 flex-grow relative">
                        {weekDays.map((date, dayIndex) => {
                            const eventsForThisDay = filterEventsForDate(
                                date,
                                events
                            );

                            // Sort events by start time for grouping
                            const sortedDailyEvents = [
                                ...eventsForThisDay,
                            ].sort(
                                (a, b) =>
                                    new Date(a.startTime).getTime() -
                                    new Date(b.startTime).getTime()
                            );
                            const dailyEventGroups =
                                groupOverlappingEvents(sortedDailyEvents);

                            return (
                                <div
                                    key={dayIndex}
                                    className="border-l border-gray-200 dark:border-slate-600 first:border-l-0 relative"
                                >
                                    {/* Current time indicator */}
                                    {isToday(date) && (
                                        <div
                                            className="absolute w-[calc(100%+1px)] -left-[1px] z-30"
                                            style={getCurrentTimeIndicatorStyles(
                                                new Date()
                                            )}
                                        >
                                            <div className="relative flex items-center">
                                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                                <div className="h-[2px] w-full bg-primary"></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Hour Slot Backgrounds */}
                                    {Array.from({ length: 24 }, (_, hour) => (
                                        <div
                                            key={`${dayIndex}-${hour}-slot`}
                                            className="border-t border-gray-200 dark:border-slate-600 relative hover:bg-gray-50 dark:hover:bg-slate-800/30"
                                            style={{
                                                height: `${hourHeight}px`,
                                            }}
                                            onClick={(e) =>
                                                handleSlotClick(date, hour, e)
                                            }
                                        ></div>
                                    ))}

                                    {/* Render Events for this day using groups */}
                                    {dailyEventGroups.map((group) => {
                                        const groupSize = group.length;
                                        const eventWidthPercent =
                                            100 / groupSize;

                                        // Sort within the group for consistent horizontal order
                                        const sortedGroup = [...group].sort(
                                            (a, b) =>
                                                new Date(
                                                    a.startTime
                                                ).getTime() -
                                                new Date(b.startTime).getTime()
                                        );

                                        return sortedGroup.map(
                                            (event, indexInGroup) => {
                                                const dayStartEpoch = new Date(
                                                    date
                                                ).setHours(0, 0, 0, 0);
                                                const dayEndEpoch = new Date(
                                                    date
                                                ).setHours(24, 0, 0, 0);
                                                const eventStartEpoch =
                                                    new Date(
                                                        event.startTime
                                                    ).getTime();
                                                const eventEndEpoch = new Date(
                                                    event.endTime
                                                ).getTime();

                                                const effectiveStartEpoch =
                                                    Math.max(
                                                        eventStartEpoch,
                                                        dayStartEpoch
                                                    );
                                                const effectiveEndEpoch =
                                                    Math.min(
                                                        eventEndEpoch,
                                                        dayEndEpoch
                                                    );

                                                if (
                                                    effectiveEndEpoch <=
                                                    effectiveStartEpoch
                                                )
                                                    return null;

                                                const effectiveStart = new Date(
                                                    effectiveStartEpoch
                                                );
                                                const effectiveEnd = new Date(
                                                    effectiveEndEpoch
                                                );

                                                const displayStartHour =
                                                    effectiveStart.getHours() +
                                                    effectiveStart.getMinutes() /
                                                        60;
                                                let displayEndHour =
                                                    effectiveEnd.getHours() +
                                                    effectiveEnd.getMinutes() /
                                                        60;
                                                if (
                                                    displayEndHour === 0 &&
                                                    effectiveEnd.getTime() ===
                                                        dayEndEpoch
                                                ) {
                                                    displayEndHour = 24;
                                                }

                                                const eventTop =
                                                    displayStartHour *
                                                    hourHeight;
                                                const eventHeight = Math.max(
                                                    (displayEndHour -
                                                        displayStartHour) *
                                                        hourHeight,
                                                    hourHeight / 4
                                                );

                                                if (eventHeight <= 0)
                                                    return null;

                                                const leftPercent =
                                                    indexInGroup *
                                                    eventWidthPercent;

                                                return (
                                                    <div
                                                        key={event.id}
                                                        data-event-id={event.id}
                                                        className="absolute hover:cursor-pointer rounded-md px-2 py-1 overflow-hidden hover:brightness-90 transition-all shadow-sm text-white"
                                                        style={{
                                                            top: `${eventTop}px`,
                                                            height: `${eventHeight}px`,
                                                            left: `${leftPercent}%`,
                                                            width: `calc(${eventWidthPercent}% - 4px)`,
                                                            marginLeft: "2px",
                                                            marginRight: "2px",
                                                            background: `linear-gradient(to bottom, ${adjustColor(event.color || "#3b82f6", 35)}, ${event.color || "#3b82f6"}, ${adjustColor(event.color || "#3b82f6", -20)})`,
                                                            zIndex: 20, // Keep zIndex above slots, consider dynamic zIndex for finer control if needed
                                                        }}
                                                        onClick={(domE) =>
                                                            handleEventClick(
                                                                event,
                                                                domE
                                                            )
                                                        }
                                                    >
                                                        <p className="text-sm font-semibold truncate leading-tight">
                                                            {event.name}
                                                        </p>
                                                        <p className="text-xs truncate leading-tight opacity-90">
                                                            {new Date(
                                                                event.startTime
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                }
                                                            )}{" "}
                                                            -{" "}
                                                            {new Date(
                                                                event.endTime
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "numeric",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ScrollArea>

            {/* Dialogs and Sheets */}
            <AddEventDialog
                isOpen={showAddEventDialog}
                onClose={() => setShowAddEventDialog(false)}
                position={dialogPosition}
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
