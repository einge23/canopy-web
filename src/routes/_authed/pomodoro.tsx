import { createFileRoute } from "@tanstack/react-router";
import CountdownTimer from "~/components/Pomodoro/countdown-timer";

export const Route = createFileRoute("/_authed/pomodoro")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <>
            <header className="p-2">
                <h1 className="text-2xl font-bold">Pomodoro Dashboard</h1>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <CountdownTimer />
                </div>

                <div className="lg:col-span-2">Text</div>
            </div>
        </>
    );
}
