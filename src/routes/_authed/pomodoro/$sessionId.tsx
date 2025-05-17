import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowDownCircle } from "lucide-react";
import CountdownTimer from "@/components/Pomodoro/countdown-timer";
import Notes from "@/components/Pomodoro/notes";
import Tasks from "@/components/Pomodoro/tasks";
import SessionHistory from "~/components/Pomodoro/session-history";

export const Route = createFileRoute("/_authed/pomodoro/$sessionId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { sessionId } = useParams({ from: Route.id });
    const numericSessionId = sessionId ? parseInt(sessionId, 10) : null;
    const [showViewportScrollHint, setShowViewportScrollHint] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 30) {
                setShowViewportScrollHint(false);
                window.removeEventListener("scroll", handleScroll);
            }
        };

        if (window.innerHeight < document.body.scrollHeight) {
            window.addEventListener("scroll", handleScroll);
        } else {
            setShowViewportScrollHint(false);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <CountdownTimer initialSessionId={numericSessionId} />
                    <SessionHistory />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="h-1/3">
                        <Tasks />
                    </div>
                    <div className="h-2/3">
                        <Notes />
                    </div>
                </div>
            </div>

            {showViewportScrollHint && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center">
                    <ArrowDownCircle className="w-7 h-7 text-slate-500/60 animate-pulse" />
                    <span className="text-xs text-slate-500/70 mt-1">
                        Scroll
                    </span>
                </div>
            )}
        </>
    );
}
