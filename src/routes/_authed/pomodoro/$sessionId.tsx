import { createFileRoute, useParams } from "@tanstack/react-router";
import CountdownTimer from "@/components/Pomodoro/countdown-timer";
import Notes from "@/components/Pomodoro/notes";
import Tasks from "@/components/Pomodoro/tasks";

export const Route = createFileRoute("/_authed/pomodoro/$sessionId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { sessionId } = useParams({ from: Route.id });
    const numericSessionId = sessionId ? parseInt(sessionId, 10) : null;

    return (
        <>
            <div className="p-2 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-1 flex flex-col">
                    {/* Pass the sessionId to the CountdownTimer */}
                    <CountdownTimer initialSessionId={numericSessionId} />
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="h-1/3">
                        <Tasks />
                    </div>
                    <div className="h-2/3">
                        <Notes />
                    </div>
                </div>
            </div>
        </>
    );
}
