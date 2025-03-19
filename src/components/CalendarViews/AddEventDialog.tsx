import { motion } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@clerk/clerk-react";
import { CreateEventRequest } from "~/models/events";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState, useEffect, useRef } from "react";
import { getTimeOptionsStartingFrom } from "~/utils/calendar";

type AddEventDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    position: { left: number; top: number };
    time: Date | null;
};

export default function AddEventDialog({
    isOpen,
    onClose,
    position,
    time,
}: AddEventDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const initialStart = time ? new Date(time) : new Date();
    initialStart.setMinutes(Math.floor(initialStart.getMinutes() / 15) * 15);
    initialStart.setSeconds(0, 0);

    const initialEnd = new Date(initialStart);
    initialEnd.setHours(initialStart.getHours() + 1);

    const { userId } = useAuth();

    // Track if popover is open to prevent dialog closing
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
    const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);

    // Get time options based on start date - computed once and reused
    const timeOptions = useMemo(
        () => getTimeOptionsStartingFrom(initialStart),
        [] // Only compute on initial render
    );

    const addEventForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            location: "",
            color: "#55CBCD",
            recurrence_rule: "Never",
            start: initialStart,
            end: initialEnd,
            user_id: userId || "",
        } as CreateEventRequest,
        onSubmit: async (values) => {
            console.log(values);
            onClose();
        },
    });

    // Handle form submission
    const handleSubmit = () => {
        addEventForm.handleSubmit();
    };

    // Fixed outside click handler that respects popover states
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            const dialog = dialogRef.current;
            const target = e.target as Node;

            // Check if we're clicking outside AND no popover is open
            if (
                dialog &&
                !dialog.contains(target) &&
                !isCalendarOpen &&
                !isStartTimeOpen &&
                !isEndTimeOpen
            ) {
                // Find if we clicked on a popover
                const isClickOnPopover = !!document
                    .querySelector(".popover-content")
                    ?.contains(target);
                const isClickOnSelectContent = !!document
                    .querySelector('[role="listbox"]')
                    ?.contains(target);

                // Only close if we're not clicking on a popover
                if (!isClickOnPopover && !isClickOnSelectContent) {
                    onClose();
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, isCalendarOpen, isStartTimeOpen, isEndTimeOpen]);

    return (
        <motion.div
            ref={dialogRef}
            id="event-form-dialog"
            className="fixed z-50 bg-gradient-to-b from-sage to-teal rounded-md shadow-lg border p-4 w-80"
            style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="space-y-4">
                <addEventForm.Field
                    name="name"
                    children={(field) => (
                        <>
                            <Input
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                placeholder="New event"
                                className="p-3 font-light text-white rounded-md"
                                onChange={(e) =>
                                    field.handleChange(e.target.value)
                                }
                            />
                        </>
                    )}
                />

                {/* Date Picker - using form field */}
                <addEventForm.Field
                    name="start"
                    children={(field) => (
                        <div className="flex items-center gap-2">
                            <Popover
                                open={isCalendarOpen}
                                onOpenChange={setIsCalendarOpen}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal text-white bg-transparent border-white"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(field.state.value, "PPP")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Calendar
                                        mode="single"
                                        selected={field.state.value}
                                        onSelect={(newDate) => {
                                            if (newDate) {
                                                // Preserve the time from the original date
                                                const updatedDate = new Date(
                                                    newDate
                                                );
                                                updatedDate.setHours(
                                                    field.state.value.getHours(),
                                                    field.state.value.getMinutes(),
                                                    0,
                                                    0
                                                );
                                                field.handleChange(updatedDate);

                                                // Also update end date to maintain the same day
                                                // Fix: Properly handle the Promise returned by getFieldValue
                                                addEventForm
                                                    .getFieldValue("end")
                                                    .then(
                                                        (
                                                            endDateValue: Date
                                                        ) => {
                                                            if (endDateValue) {
                                                                const newEnd =
                                                                    new Date(
                                                                        endDateValue
                                                                    );
                                                                newEnd.setFullYear(
                                                                    updatedDate.getFullYear(),
                                                                    updatedDate.getMonth(),
                                                                    updatedDate.getDate()
                                                                );
                                                                addEventForm.setFieldValue(
                                                                    "end",
                                                                    newEnd
                                                                );
                                                            }
                                                        }
                                                    );
                                                setIsCalendarOpen(false);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                />

                {/* Time Range - using form fields */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Start Time */}
                    <addEventForm.Field
                        name="start"
                        children={(field) => (
                            <Select
                                open={isStartTimeOpen}
                                onOpenChange={setIsStartTimeOpen}
                                value={format(field.state.value, "HH:mm")}
                                onValueChange={(time: string) => {
                                    const [hours, minutes] = time
                                        .split(":")
                                        .map(Number);
                                    const newDate = new Date(field.state.value);
                                    newDate.setHours(hours, minutes, 0, 0);
                                    field.handleChange(newDate);

                                    // Ensure end time is after start time
                                    // Fix: Properly type the Promise resolution
                                    addEventForm
                                        .getFieldValue("start")
                                        .then((startDateValue: Date) => {
                                            if (
                                                startDateValue &&
                                                startDateValue <= newDate
                                            ) {
                                                const newStart = new Date(
                                                    newDate
                                                );
                                                newStart.setHours(
                                                    hours + 1,
                                                    minutes,
                                                    0,
                                                    0
                                                );
                                                addEventForm.setFieldValue(
                                                    "start",
                                                    newStart
                                                );
                                            }
                                        });
                                    setIsStartTimeOpen(false);
                                }}
                            >
                                <SelectTrigger
                                    className="bg-transparent text-white border-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <SelectValue placeholder="Start time">
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4" />
                                            {format(
                                                field.state.value,
                                                "h:mm a"
                                            )}
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {timeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />

                    {/* End Time */}
                    <addEventForm.Field
                        name="end"
                        children={(field) => (
                            <Select
                                open={isEndTimeOpen}
                                onOpenChange={setIsEndTimeOpen}
                                value={format(field.state.value, "HH:mm")}
                                onValueChange={(time: string) => {
                                    const [hours, minutes] = time
                                        .split(":")
                                        .map(Number);
                                    const newDate = new Date(field.state.value);
                                    newDate.setHours(hours, minutes, 0, 0);
                                    field.handleChange(newDate);
                                    setIsEndTimeOpen(false);
                                }}
                            >
                                <SelectTrigger
                                    className="bg-transparent text-white border-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <SelectValue placeholder="End time">
                                        <div className="flex items-center">
                                            <Clock className="mr-2 h-4 w-4" />
                                            {format(
                                                field.state.value,
                                                "h:mm a"
                                            )}
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {timeOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        className="text-sm text-white hover:text-gray-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        className="text-sm bg-white text-teal-600 hover:bg-gray-100 px-2 py-1 rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSubmit();
                        }}
                    >
                        Create
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
