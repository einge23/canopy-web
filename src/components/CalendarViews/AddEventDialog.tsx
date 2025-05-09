import {
    CustomDialogContent,
    Dialog,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { useForm } from "@tanstack/react-form";
import { useAuth } from "@clerk/tanstack-start";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "../ui/select";
import { getTimeOptionsStartingFrom } from "~/utils/calendar";
import {
    Blend,
    CalendarIcon,
    CalendarPlus,
    MapPin,
    Pencil,
    RotateCw,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { adjustColor } from "~/lib/random-helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCalendar } from "~/contexts/CalendarContext";
import { toast } from "sonner";
import StyledButton from "../Navbar/StyledButton";
import { CreateEventRequest } from "~/models/events";
import { createEvent } from "~/api/events";
import { format } from "date-fns";
import { useState } from "react";

interface AddEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    initialStart: Date;
}

type CreateEventFormValues = Omit<
    CreateEventRequest,
    "startTime" | "endTime"
> & {
    startTime: Date;
    endTime: Date;
};

export default function AddEventDialog({
    isOpen,
    onClose,
    position,
    initialStart,
}: AddEventDialogProps) {
    const initialEnd = new Date(initialStart);
    initialEnd.setHours(initialStart.getHours() + 1);
    const { viewType, viewDate, selectedDate } = useCalendar();
    const { userId, getToken } = useAuth();

    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const queryClient = useQueryClient();

    const { isPending, mutate } = useMutation({
        mutationFn: async (values: CreateEventRequest) => {
            const token = await getToken();
            if (!token) {
                throw new Error("No token found");
            }
            console.log("Token:", token);
            return createEvent(values, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["events", "monthly", currentYear, currentMonth],
            });
            onClose();
            toast.success("Event added successfully");
        },
        onError: () => {
            onClose();
            toast.error("Failed to add event");
        },
    });

    const addEventForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            location: "",
            color: "#55CBCD",
            recurrenceRule: "Never",
            startTime: initialStart,
            endTime: initialEnd,
            userId: userId ?? "",
        } as CreateEventFormValues,
        onSubmit: async (values) => {
            console.log(values);
            const payload: CreateEventRequest = {
                ...values.value,
                startTime: values.value.startTime,
                endTime: values.value.endTime,
            };
            mutate(payload);
        },
    });

    const convertTimeToDate = (time: string, originalDate: Date) => {
        const [hours, minutes] = time.split(":");
        const date = new Date(originalDate); // Use the original date
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <CustomDialogContent
                x={position.x}
                y={position.y}
                className="overflow-y-auto max-w-[400px] overflow-x-hidden"
            >
                <DialogTitle>Add Event</DialogTitle>
                <div className="whitespace-normal break-words">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-start space-x-2 text-sm">
                            <CalendarPlus />
                            <addEventForm.Field
                                name="name"
                                children={(field) => {
                                    return (
                                        <>
                                            <Input
                                                placeholder="New event"
                                                className="placeholder:text-gray-500 placeholder:text-lg  max-w-[400px] text-ellipsis text-lg"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                                autoFocus
                                            />
                                        </>
                                    );
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-start space-x-2 text-sm">
                            <CalendarIcon />
                            <addEventForm.Field
                                name="startTime"
                                children={(field) => {
                                    return (
                                        <Select
                                            value={formatTime(
                                                field.state.value
                                            )}
                                            onValueChange={(value) => {
                                                const newDate =
                                                    convertTimeToDate(
                                                        value,
                                                        field.state.value
                                                    );
                                                field.handleChange(newDate);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <p className="hover:underline">
                                                    {formatTime(
                                                        field.state.value
                                                    )}
                                                </p>
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                className="max-h-[200px] overflow-y-auto"
                                            >
                                                <SelectGroup>
                                                    {getTimeOptionsStartingFrom(
                                                        field.state.value
                                                    ).map((time) => (
                                                        <SelectItem
                                                            key={time.value}
                                                            value={time.value}
                                                        >
                                                            {time.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                            <span>-</span>
                            <addEventForm.Field
                                name="endTime"
                                children={(field) => {
                                    return (
                                        <Select
                                            value={formatTime(
                                                field.state.value
                                            )}
                                            onValueChange={(value) => {
                                                const newDate =
                                                    convertTimeToDate(
                                                        value,
                                                        field.state.value
                                                    );
                                                field.handleChange(newDate);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <p className="hover:underline">
                                                    {formatTime(
                                                        field.state.value
                                                    )}
                                                </p>
                                            </SelectTrigger>
                                            <SelectContent
                                                position="popper"
                                                className="max-h-[200px] overflow-y-auto"
                                            >
                                                <SelectGroup>
                                                    {getTimeOptionsStartingFrom(
                                                        field.state.value
                                                    ).map((time) => (
                                                        <SelectItem
                                                            key={time.value}
                                                            value={time.value}
                                                        >
                                                            {time.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        </div>
                        <addEventForm.Field
                            name="location"
                            children={(field) => {
                                return (
                                    <div className="flex items-center space-x-2">
                                        <MapPin />
                                        <Input
                                            placeholder="Location"
                                            className="placeholder:text-gray-500 placeholder:text-lg max-w-[400px] text-ellipsis text-s"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                );
                            }}
                        />
                        <addEventForm.Field
                            name="color"
                            children={(field) => {
                                const colorOptions = [
                                    "#55CBCD",
                                    "#97C2A9",
                                    "#FF968A",
                                    "#FFCBA2",
                                    "#CBAACB",
                                    "#FEE1E8",
                                ];

                                return (
                                    <div className="flex items-center space-x-2">
                                        <Blend />
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() =>
                                                        field.handleChange(
                                                            color
                                                        )
                                                    }
                                                    className={`w-8 h-8 rounded-md transition-all ${
                                                        (
                                                            field.state
                                                                .value === color
                                                        ) ?
                                                            "ring-2 ring-offset-2 ring-gray-400"
                                                        :   "hover:scale-110"
                                                    }`}
                                                    style={{
                                                        background: `linear-gradient(to bottom, ${color}, ${adjustColor(
                                                            color,
                                                            -20
                                                        )})`,
                                                    }}
                                                    aria-label={`Select color ${color}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        <div className="flex items-center justify-start space-x-2  mt-4 text-sm">
                            <Pencil />
                            <addEventForm.Field
                                name="description"
                                children={(field) => {
                                    return (
                                        <>
                                            <Textarea
                                                placeholder="Description"
                                                className="placeholder:text-gray-500 placeholder:text-lg  max-w-[400px] text-ellipsis text-s"
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </>
                                    );
                                }}
                            />
                        </div>
                    </div>
                    <addEventForm.Field
                        name="recurrenceRule"
                        children={(field) => {
                            const recurrenceOptions = [
                                "Never",
                                "Daily",
                                "Weekly",
                                "Monthly",
                                "Yearly",
                            ];

                            return (
                                <div className="flex mt-2 items-center space-x-2">
                                    <RotateCw />
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {recurrenceOptions.map((option) => (
                                            <Button
                                                key={option}
                                                type="button"
                                                variant={
                                                    (
                                                        field.state.value ===
                                                        option
                                                    ) ?
                                                        "default"
                                                    :   "outline"
                                                }
                                                className={`px-3 py-1 text-sm ${
                                                    (
                                                        field.state.value ===
                                                        option
                                                    ) ?
                                                        "bg-primary text-primary-foreground"
                                                    :   "hover:bg-primary/10"
                                                }`}
                                                onClick={() =>
                                                    field.handleChange(option)
                                                }
                                            >
                                                {option}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>

                <DialogFooter>
                    <StyledButton
                        disabled={addEventForm.state.isSubmitting}
                        isLoading={isPending}
                        onClick={addEventForm.handleSubmit}
                    >
                        Add Event
                    </StyledButton>
                </DialogFooter>
            </CustomDialogContent>
        </Dialog>
    );
}
