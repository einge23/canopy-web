import { CreateEventRequest } from "~/models/events";
import {
    CustomDialogContent,
    Dialog,
    DialogFooter,
    DialogHeader,
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
    SelectValue,
} from "../ui/select";
import { ALL_TIME_OPTIONS, getTimeOptionsStartingFrom } from "~/utils/calendar";
import { useMemo } from "react";

interface AddEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    initialStart: Date;
}

export default function AddEventDialog({
    isOpen,
    onClose,
    position,
    initialStart,
}: AddEventDialogProps) {
    const initialEnd = new Date(initialStart);
    initialEnd.setHours(initialStart.getHours() + 1);

    const { userId } = useAuth();
    const addEventForm = useForm({
        defaultValues: {
            name: "",
            description: "",
            location: "",
            color: "#55CBCD",
            recurrence_rule: "Never",
            start: initialStart,
            end: initialEnd,
            user_id: userId,
        } as CreateEventRequest,
    });

    const startTimeOptions = useMemo(() => {
        return getTimeOptionsStartingFrom(initialStart);
    }, [initialStart]);

    const convertTimeToDate = (time: string) => {
        const [hours, minutes] = time.split(":");
        const date = new Date(initialStart);
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return date;
    };

    const formatTime = (hours: number, minutes: number) => {
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <CustomDialogContent
                x={position.x}
                y={position.y}
                className="overflow-y-auto max-w-[400px] overflow-x-hidden"
            >
                <div className="whitespace-normal break-words">
                    {initialStart.toLocaleTimeString()} -{" "}
                    {initialEnd.toLocaleTimeString()}
                    <div className="flex flex-col space-y-4">
                        <addEventForm.Field
                            name="name"
                            children={(field) => {
                                return (
                                    <>
                                        <Input
                                            placeholder="New event"
                                            className="placeholder:text-gray-500 placeholder:text-lg  max-w-[600px] text-ellipsis text-lg"
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <p className="break-words whitespace-normal">
                                            {field.state.value}
                                        </p>
                                    </>
                                );
                            }}
                        />
                        <addEventForm.Field
                            name="start"
                            children={(field) => {
                                const timeString =
                                    field.state.value.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    });

                                return (
                                    <>
                                        <Select
                                            value={timeString}
                                            onValueChange={(value) =>
                                                field.handleChange(
                                                    convertTimeToDate(value)
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <p className="hover:underline">
                                                    {formatTime(
                                                        field.state.value.getHours(),
                                                        field.state.value.getMinutes()
                                                    )}
                                                </p>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {startTimeOptions.map(
                                                        (time) => (
                                                            <SelectItem
                                                                key={time.value}
                                                                value={
                                                                    time.value
                                                                }
                                                            >
                                                                {time.label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <p>
                                            {field.state.value.toTimeString()}
                                        </p>
                                    </>
                                );
                            }}
                        />
                    </div>
                </div>
            </CustomDialogContent>
            <DialogFooter></DialogFooter>
        </Dialog>
    );
}
