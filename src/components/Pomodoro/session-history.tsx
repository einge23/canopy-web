import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { History, TrendingUp, Brain, ChevronDown } from "lucide-react";
import { PomodoroSession, PomodoroStatus } from "~/models/pomodoro/sessions";
import { format } from "date-fns";

const placeholderSessions: PomodoroSession[] = [
    {
        id: 1,
        user_id: "user_123",
        start_time: new Date("2023-10-28T09:00:00Z"),
        end_time: new Date("2023-10-28T09:25:00Z"),
        duration_minutes: 25,
        status_type_id: "completed",
        goal: "Finish report draft",
        calendar_event_id: null,
        task_ids: [1, 2, 3],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        completed_focus_cycles: 1,
        completed_short_break_cycles: 0,
        completed_long_break_cycles: 0,
    },
    {
        id: 2,
        user_id: "user_123",
        start_time: new Date("2023-10-27T14:00:00Z"),
        end_time: new Date("2023-10-27T14:50:00Z"),
        duration_minutes: 50,
        status_type_id: "completed",
        goal: "Plan project architecture",
        calendar_event_id: 101,
        task_ids: [4],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        completed_focus_cycles: 2,
        completed_short_break_cycles: 0,
        completed_long_break_cycles: 0,
    },
    {
        id: 3,
        user_id: "user_123",
        start_time: new Date("2023-10-26T11:00:00Z"),
        end_time: new Date("2023-10-26T11:25:00Z"),
        duration_minutes: 25,
        status_type_id: "completed",
        goal: "Research new API specifications",
        calendar_event_id: null,
        task_ids: [5, 6],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        completed_focus_cycles: 1,
        completed_short_break_cycles: 0,
        completed_long_break_cycles: 0,
    },
    {
        id: 4,
        user_id: "user_123",
        start_time: new Date("2023-10-25T16:30:00Z"),
        end_time: new Date("2023-10-25T16:55:00Z"),
        duration_minutes: 25,
        status_type_id: "paused",
        goal: "Debug payment module",
        calendar_event_id: null,
        task_ids: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        completed_focus_cycles: 0,
        completed_short_break_cycles: 0,
        completed_long_break_cycles: 0,
    },
    {
        id: 5,
        user_id: "user_123",
        start_time: new Date("2023-10-24T10:00:00Z"),
        end_time: new Date("2023-10-24T10:25:00Z"),
        duration_minutes: 25,
        status_type_id: "completed",
        goal: "Write unit tests for X feature",
        calendar_event_id: null,
        task_ids: [10, 11],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        completed_focus_cycles: 1,
        completed_short_break_cycles: 0,
        completed_long_break_cycles: 0,
    },
];

const mockInsights = {
    totalFocusMinutes: placeholderSessions
        .filter(
            (s) =>
                s.status_type_id === "completed" ||
                s.status_type_id === "inprogress"
        )
        .reduce((acc, s) => acc + s.duration_minutes, 0),
    sessionsThisWeek: placeholderSessions.length,
    longestStreak: 3,
};

export default function SessionHistory() {
    const getSessionIcon = (status: PomodoroStatus) => {
        return <Brain className="w-4 h-4 mr-2 text-emerald-500" />;
    };

    return (
        <Card className="w-full h-full shadow-lg flex flex-col bg-card">
            <CardHeader className="shrink-0 flex items-center">
                Session History
            </CardHeader>
            <CardContent className="flex flex-col flex-grow p-0 overflow-hidden relative">
                <div className="px-4 pb-4 pt-0 border-b border-emerald-200/50 dark:border-emerald-700/50">
                    <h4 className="text-sm font-semibold mb-2 text-emerald-700 dark:text-emerald-300 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Your Activity Insights
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <p>
                            Total Focus:{" "}
                            <span className="font-semibold">
                                {(mockInsights.totalFocusMinutes / 60).toFixed(
                                    1
                                )}{" "}
                                hrs
                            </span>
                        </p>
                        <p>
                            Sessions this week:{" "}
                            <span className="font-semibold">
                                {mockInsights.sessionsThisWeek}
                            </span>
                        </p>
                    </div>
                </div>

                <ScrollArea className="flex-grow max-h-64">
                    <div className="p-4 space-y-3">
                        {placeholderSessions.length > 0 ?
                            placeholderSessions.map((session) => (
                                <Link
                                    key={session.id}
                                    to="/pomodoro/$sessionId"
                                    params={{ sessionId: String(session.id) }}
                                    className="block p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-800/50 transition-colors shadow-sm border border-emerald-200/30 dark:border-emerald-700/30"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                            {getSessionIcon(
                                                session.status_type_id
                                            )}
                                            <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-200">
                                                Focus Session -{" "}
                                                {session.duration_minutes} min
                                                {session.status_type_id ===
                                                    "paused" && " (Paused)"}
                                                {session.status_type_id ===
                                                    "inprogress" &&
                                                    " (In Progress)"}
                                            </span>
                                        </div>
                                        <span className="text-xs text-emerald-500 dark:text-emerald-400">
                                            {format(
                                                new Date(session.start_time),
                                                "MMM dd, yyyy"
                                            )}
                                        </span>
                                    </div>
                                    {session.goal && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-300 truncate">
                                            Goal: {session.goal}
                                        </p>
                                    )}
                                    {session.task_ids &&
                                        session.task_ids.length > 0 && (
                                            <p className="text-xs text-emerald-600 dark:text-emerald-300">
                                                Tasks Worked On:{" "}
                                                {session.task_ids.length}
                                            </p>
                                        )}
                                </Link>
                            ))
                        :   <div className="text-center py-8">
                                <p className="text-emerald-500 dark:text-emerald-400">
                                    No sessions recorded yet.
                                </p>
                                <p className="text-xs text-emerald-400 dark:text-emerald-500">
                                    Start a Pomodoro timer to see your history!
                                </p>
                            </div>
                        }
                    </div>
                </ScrollArea>
                {placeholderSessions.length > 3 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                        <ChevronDown className="w-5 h-5 text-emerald-400/80" />{" "}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
