import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/tanstack-start";
import { Link } from "@tanstack/react-router";
import {
    Bell,
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    LayoutGrid,
    Leaf,
    Plus,
    SunIcon,
    SunMoonIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import StyledButton from "./StyledButton";
import StyledInput from "./StyledInput";
import { SidebarTrigger } from "../ui/sidebar";
import { useCalendar } from "~/contexts/CalendarContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLocation } from "@tanstack/react-router";

export default function Navbar() {
    const { pathname } = useLocation();
    const {
        viewType,
        setViewType,
        prevMonth,
        nextMonth,
        prevWeek,
        nextWeek,
        prevDay,
        nextDay,
        formatViewDate,
    } = useCalendar();

    const handleNavigation = {
        prev: () => {
            if (viewType === "month") prevMonth();
            else if (viewType === "week") prevWeek();
            else prevDay();
        },
        next: () => {
            if (viewType === "month") nextMonth();
            else if (viewType === "week") nextWeek();
            else nextDay();
        },
    };

    return (
        <nav className="flex items-center justify-between p-4 w-full">
            {/* Left section - Month selection */}
            {pathname.includes("/pomodoro") ?
                <div className="flex items-center gap-2 shrink-0">
                    <SidebarTrigger />
                    <h1 className="text-xl font-semibold">
                        Pomodoro Dashboard
                    </h1>
                </div>
            :   <div className="flex items-center gap-2 shrink-0">
                    <SidebarTrigger />
                    <Button
                        className="bg-background"
                        onClick={handleNavigation.prev}
                    >
                        <ChevronLeft />
                    </Button>
                    <h1>{formatViewDate()}</h1>
                    <Button
                        className="bg-background"
                        onClick={handleNavigation.next}
                    >
                        <ChevronRight />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-2">
                                {viewType === "month" && (
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                )}
                                {viewType === "week" && (
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                )}
                                {viewType === "day" && (
                                    <Clock className="mr-2 h-4 w-4" />
                                )}
                                {viewType.charAt(0).toUpperCase() +
                                    viewType.slice(1)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => setViewType("month")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Month
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setViewType("week")}
                            >
                                <LayoutGrid className="mr-2 h-4 w-4" />
                                Week
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setViewType("day")}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Day
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            }

            <div className="flex items-center gap-4 shrink-0">
                <StyledInput className="hidden md:block" />
                <StyledButton>
                    <Plus /> <span className="hidden sm:inline">Add Event</span>
                </StyledButton>
                <Bell className="cursor-pointer" />
                <SunIcon className="cursor-pointer" />
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal" />
                </SignedOut>
            </div>
        </nav>
    );
}
