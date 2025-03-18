import {
    SignedIn,
    SignedOut,
    SignIn,
    SignInButton,
} from "@clerk/tanstack-start";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <>
            <SignedIn>
                <Navigate to="/calendar" />
            </SignedIn>
            <SignedOut>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="rounded-lg shadow-xl">
                        <SignIn />
                    </div>
                </div>
            </SignedOut>
        </>
    );
}
