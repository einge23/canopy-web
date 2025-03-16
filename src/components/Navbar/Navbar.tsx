import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/tanstack-start";
import { Link } from "@tanstack/react-router";
import {
    Bell,
    ChevronLeft,
    ChevronRight,
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

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between p-4 w-full">
            {/* Left section - Month selection */}
            <div className="flex items-center gap-2 shrink-0">
                <SidebarTrigger />

                <Button className="bg-background">
                    <ChevronLeft />
                </Button>
                <h1>March 2025</h1>
                <Button className="bg-background">
                    <ChevronRight />
                </Button>
            </div>

            {/* Right section - Controls */}
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
