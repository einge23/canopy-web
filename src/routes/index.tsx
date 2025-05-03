import {
    SignedIn,
    SignedOut,
    SignIn,
    SignInButton,
    useAuth,
} from "@clerk/tanstack-start";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { useCalendar } from "~/contexts/CalendarContext";

export const Route = createFileRoute("/")({
    beforeLoad: async ({ context }) => {
        if (context.userId) {
            throw redirect({
                to: "/calendar",
                search: { viewType: "month" },
            });
        }
    },
    component: Home,
});

function Home() {
    const { viewType } = useCalendar();
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                Loading authentication...
            </div>
        );
    }

    return (
        <>
            <SignedOut>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="rounded-lg shadow-xl">
                        <SignIn routing="hash" />{" "}
                    </div>
                </div>
            </SignedOut>
        </>
    );
}
