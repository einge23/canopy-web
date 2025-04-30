import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/tanstack-start";
import { useForm } from "@tanstack/react-form";
import { CalendarEvent } from "~/models/events";

interface EditEventSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: CalendarEvent | null;
}

export function EditEventSheet({
    open,
    onOpenChange,
    event,
}: EditEventSheetProps) {
    const { userId } = useAuth();

    const editEventForm = useForm({
        defaultValues: {
            name: event?.name,
            description: event?.description,
            location: event?.location,
            color: event?.color,
            startTime: event?.startTime,
            endTime: event?.endTime,
            userId: userId,
            recurrenceRule: event?.recurrence_rule,
        },
    });

    const convertTimeToDate = (time: string, originalDate: Date) => {
        const [hours, minutes] = time.split(":");
        const date = new Date(originalDate);
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[700px]">
                <SheetHeader>
                    <SheetTitle>Edit Event</SheetTitle>
                    <SheetDescription>
                        Make changes to your event here. Click save when you're
                        done.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex items-center justify-start space-x-2 text-sm p-4">
                    <editEventForm.Field
                        name="name"
                        children={(field) => {
                            return (
                                <>
                                    <Input
                                        placeholder="Name"
                                        className="placeholder:text-gray-500 placeholder:text-lg  max-w-[400px] text-ellipsis text-lg"
                                        id={field.name}
                                        value={field.state.value}
                                        onChange={(e) => {
                                            field.setValue(e.target.value);
                                        }}
                                    ></Input>
                                </>
                            );
                        }}
                    ></editEventForm.Field>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
