import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PomodoroSession } from "~/models/pomodoro/sessions";

interface SessionInfoCardProps {
    session: PomodoroSession | null | undefined;
}

const SessionInfoCard: React.FC<SessionInfoCardProps> = ({ session }) => {
    if (!session) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Session Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Loading session details...</p>
                </CardContent>
            </Card>
        );
    }

    const completedPomodoros = session.completed_focus_cycles ?? 0;
    const completedShortBreaks = session.completed_short_break_cycles ?? 0;
    const completedLongBreaks = session.completed_long_break_cycles ?? 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Session Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-xl font-semibold tracking-tight">
                    {session.goal || "No goal set"}
                </p>
                <div>
                    <h4 className="text-md font-medium mb-2">
                        Completed Cycles:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Pomodoros: {completedPomodoros}</li>
                        <li>Short Breaks: {completedShortBreaks}</li>
                        <li>Long Breaks: {completedLongBreaks}</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default SessionInfoCard;
