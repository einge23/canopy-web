import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/tanstack-start";
import { useForm } from "@tanstack/react-form";
import {
    CalendarIcon,
    CalendarPlus,
    MapPin,
    Blend,
    Pencil,
    RotateCw,
} from "lucide-react";
import {
    CalendarEvent,
    EditEventRequest,
    CalendarEvent as UpdateEventRequest,
} from "~/models/events";
import { useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { getTimeOptionsStartingFrom } from "~/utils/calendar";
import { adjustColor } from "~/lib/random-helpers";
import { Label } from "../ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editEvent } from "~/api/events";
import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { updateEvent } from "~/api/events";
// import { toast } from "sonner";

interface EditEventSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: CalendarEvent | null;
}

const convertTimeToDate = (time: string, originalDate: Date): Date => {
    const [hours, minutes] = time.split(":");
    const date = new Date(originalDate);
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date;
};

const formatTime = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return "00:00";
    }
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

export function EditEventSheet({
    open,
    onOpenChange,
    event,
}: EditEventSheetProps) {
    const { userId, getToken } = useAuth();
    const queryClient = useQueryClient();

    const eventDate = event?.startTime ? new Date(event.startTime) : new Date(); // Use event's date or fallback
    const currentYear = eventDate.getFullYear();
    const currentMonth = eventDate.getMonth();

    const queryKey = ["events", "monthly", currentYear, currentMonth]; // Dynamic query key

    const { mutate: editEventMutation, isPending } = useMutation({
        mutationFn: async (updatedEventData: EditEventRequest) => {
            const token = await getToken();
            if (!token) {
                throw new Error("No token found");
            }
            return editEvent(updatedEventData, token);
        },
        onMutate: async (updatedEventData: EditEventRequest) => {
            await queryClient.cancelQueries({
                queryKey: ["events", "monthly"],
            });

            const previousEvents =
                queryClient.getQueryData<CalendarEvent[]>(queryKey);
            queryClient.setQueryData(
                queryKey,
                (old: CalendarEvent[] | undefined) => {
                    if (!old) return [];
                    return old.map((ev) =>
                        ev.id === updatedEventData.id ?
                            { ...ev, ...updatedEventData }
                        :   ev
                    );
                }
            );

            return { previousEvents };
        },
        onError: (err, updatedEventData, context) => {
            if (context?.previousEvents) {
                queryClient.setQueryData(queryKey, context.previousEvents);
            }
            toast.error("Failed to update event. Please try again.");
            console.error("Error updating event:", err);
        },
        onSuccess: (data, updatedEventData) => {
            queryClient.invalidateQueries({ queryKey: queryKey });
            toast.success("Event updated successfully!");
            onOpenChange(false);
        },
    });

    const editEventForm = useForm({
        defaultValues: {
            id: event?.id ?? 0,
            name: event?.name ?? "",
            description: event?.description ?? "",
            location: event?.location ?? "",
            color: event?.color ?? "#55CBCD",
            startTime: event?.startTime ?? new Date(),
            endTime: event?.endTime ?? new Date(),
            userId: userId ?? "",
            recurrenceRule: event?.recurrence_rule ?? "Never",
        } as EditEventRequest,
        onSubmit: async ({ value }) => {
            if (!event) return;
            editEventMutation(value);
        },
    });

    useEffect(() => {
        if (event) {
            editEventForm.setFieldValue("name", event.name || "");
            editEventForm.setFieldValue("description", event.description || "");
            editEventForm.setFieldValue("location", event.location || "");
            editEventForm.setFieldValue("color", event.color || "#55CBCD");
            editEventForm.setFieldValue(
                "startTime",
                event.startTime ? new Date(event.startTime) : new Date()
            );
            editEventForm.setFieldValue(
                "endTime",
                event.endTime ? new Date(event.endTime) : new Date()
            );
            editEventForm.setFieldValue(
                "recurrenceRule",
                event.recurrence_rule || "Never"
            );
            editEventForm.setFieldValue("userId", userId || "");
        }
    }, [event, userId, editEventForm]);

    const colorOptions = [
        "#55CBCD",
        "#97C2A9",
        "#FF968A",
        "#FFCBA2",
        "#CBAACB",
        "#FEE1E8",
    ];
    const recurrenceOptions = ["Never", "Daily", "Weekly", "Monthly", "Yearly"];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader className="border-sage rounded-md m-2 border-2 shadow-md bg-sage/20">
                    <SheetTitle>Edit Event</SheetTitle>
                    <SheetDescription>
                        Make changes to your event here. Click save when you're
                        done.
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        editEventForm.handleSubmit();
                    }}
                    className="p-4 space-y-2"
                >
                    <editEventForm.Field
                        name="name"
                        children={(field) => (
                            <div className="flex items-center space-x-3">
                                <CalendarPlus className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Label
                                        htmlFor={field.name}
                                        className="text-md font-medium"
                                    >
                                        Event Name
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Event name"
                                        className="!text-lg border-2 border-sage h-14 shadow-md rounded-md bg-sage/20"
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) =>
                                            field.setValue(e.target.value)
                                        }
                                        onBlur={field.handleBlur}
                                    />
                                </div>
                            </div>
                        )}
                    />

                    <div className="flex items-center space-x-3 text-sm">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                            <Label className="text-sm font-medium">Time</Label>
                            <div className="flex items-center space-x-2">
                                <editEventForm.Field
                                    name="startTime"
                                    children={(field) => (
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
                                                const currentEndTime =
                                                    editEventForm.getFieldValue(
                                                        "endTime"
                                                    );
                                                if (newDate >= currentEndTime) {
                                                    const newEndTime = new Date(
                                                        newDate
                                                    );
                                                    newEndTime.setHours(
                                                        newDate.getHours() + 1
                                                    );
                                                    editEventForm.setFieldValue(
                                                        "endTime",
                                                        newEndTime
                                                    );
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="flex-1 border-2 border-sage h-14 shadow-md rounded-md bg-sage/20">
                                                <p className="!text-lg">
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
                                    )}
                                />
                                <span>-</span>
                                <editEventForm.Field
                                    name="endTime"
                                    children={(field) => (
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
                                            <SelectTrigger className="flex-1 border-2 border-sage h-14 shadow-md rounded-md bg-sage/20">
                                                <p className="!text-lg">
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
                                                        editEventForm.getFieldValue(
                                                            "startTime"
                                                        )
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
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <editEventForm.Field
                        name="location"
                        children={(field) => (
                            <div className="flex items-center space-x-3 text-sm">
                                <MapPin className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 space-y-1">
                                    <Label
                                        htmlFor={field.name}
                                        className="text-sm font-medium"
                                    >
                                        Location
                                    </Label>
                                    <Input
                                        placeholder="Location"
                                        className="border-2 border-sage h-14 shadow-md rounded-md bg-sage/20 !text-lg"
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) =>
                                            field.setValue(e.target.value)
                                        }
                                        onBlur={field.handleBlur}
                                    />
                                </div>
                            </div>
                        )}
                    />

                    <editEventForm.Field
                        name="color"
                        children={(field) => (
                            <div className="flex items-start space-x-3">
                                <Blend className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                                <div className="flex-1 space-y-1">
                                    <Label className="text-md font-medium">
                                        Color
                                    </Label>
                                    <div className="flex flex-wrap gap-4">
                                        {colorOptions.map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() =>
                                                    field.handleChange(c)
                                                }
                                                className={`w-12 h-12 rounded-md transition-all border-2 border-sage shadow-md  ${
                                                    field.state.value === c ?
                                                        "ring-2 ring-offset-2 ring-primary"
                                                    :   "hover:scale-110"
                                                }`}
                                                style={{
                                                    background: `linear-gradient(to bottom, ${c}, ${adjustColor(c, -20)})`,
                                                }}
                                                aria-label={`Select color ${c}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    />

                    <editEventForm.Field
                        name="description"
                        children={(field) => (
                            <div className="flex items-start space-x-3">
                                <Pencil className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                                <div className="flex-1 space-y-1">
                                    <Label className="text-md font-medium">
                                        Description
                                    </Label>
                                    <Textarea
                                        placeholder="Description"
                                        className="border-2 border-sage shadow-md rounded-md bg-sage/20 !text-lg"
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) =>
                                            field.setValue(e.target.value)
                                        }
                                        onBlur={field.handleBlur}
                                        rows={5}
                                    />
                                </div>
                            </div>
                        )}
                    />

                    <editEventForm.Field
                        name="recurrenceRule"
                        children={(field) => (
                            <div className="flex items-start space-x-3">
                                <RotateCw className="h-8 w-8 text-muted-foreground flex-shrink-0 mt-1" />
                                <div className="flex-1 space-y-1">
                                    <Label className="text-md font-medium">
                                        Recurrence Rule
                                    </Label>
                                    <div className="flex flex-wrap gap-3">
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
                                                className={`px-5 py-2.5 text-sm h-auto border-2 border-sage shadow-md rounded-md ${
                                                    (
                                                        field.state.value ===
                                                        option
                                                    ) ?
                                                        "bg-primary text-primary-foreground"
                                                    :   "bg-sage/20 hover:bg-primary/10"
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
                            </div>
                        )}
                    />

                    <SheetFooter className="pt-8">
                        <SheetClose asChild>
                            <Button className="bg-gradient-to-b from-red-500/65 to-red-700/95 font-bold text-white shadow-sm hover:brightness-90 hover:shadow-md transition-all duration-400 [text-shadow:_0_1px_1px_rgb(0_0_0_/_20%)] px-8 py-4 text-xl">
                                Cancel
                            </Button>
                        </SheetClose>
                        <Button
                            type="submit"
                            className="bg-gradient-to-b from-emerald to-emerald/65 font-bold text-white shadow-md hover:brightness-90 hover:shadow-md transition-all duration-400 [text-shadow:_0_1px_1px_rgb(0_0_0_/_20%)] px-8 py-4 text-xl"
                            disabled={
                                editEventForm.state.isSubmitting || isPending
                            }
                        >
                            {editEventForm.state.isSubmitting || isPending ?
                                "Saving..."
                            :   "Save Changes"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
