import { useState, useEffect, useRef } from "react";
import Countdown from "react-countdown";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Coffee, Brain, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
    createPomodoroSession,
    updateSessionStatus,
    getPomodoroSessionById,
} from "~/api/pomodoro-sessions";
import {
    CreatePomodoroSessionRequest,
    PomodoroStatus,
    UpdatePomodoroSessionRequest,
    PomodoroSession,
} from "~/models/pomodoro/sessions";
import { useAuth } from "@clerk/tanstack-start";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface TimerSettings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
}

export default function PomodoroTimer({
    onTimerComplete,
    initialSessionId,
}: {
    onTimerComplete?: () => void;
    initialSessionId?: number | null;
}) {
    const defaultSettings: TimerSettings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
    };

    const { getToken, userId } = useAuth();
    const navigate = useNavigate();

    const [currentSessionId, setCurrentSessionId] = useState<number | null>(
        null
    );

    const sessionQuery = useQuery({
        queryKey: ["pomodoroSession", initialSessionId],
        queryFn: async () => {
            if (!initialSessionId) throw new Error("No session ID to fetch");
            const token = await getToken();
            if (!token) throw new Error("Authentication token not found.");
            return getPomodoroSessionById(initialSessionId, token);
        },
        enabled: !!initialSessionId,
        retry: (failureCount, error: any) => {
            if (error?.response?.status === 404) return false;
            return failureCount < 2;
        },
    });

    const {
        mutate: createPomodoroSessionMutation,
        isPending: isCreatingSession,
    } = useMutation({
        mutationFn: async (request: CreatePomodoroSessionRequest) => {
            const token = await getToken();
            if (!token) {
                throw new Error("No token found");
            }
            return createPomodoroSession(request, token);
        },
        onSuccess: (data: PomodoroSession) => {
            toast.success("New pomodoro session started and saved!");
            setCurrentSessionId(data.id);
            setSettings((prev) => ({
                ...prev,
                pomodoro: data.duration_minutes,
            }));
            setTimeLeft(data.duration_minutes * 60 * 1000);
            setIsRunning(true);
            setKey((prevKey) => prevKey + 1);
            if (countdownRef.current) {
                countdownRef.current.start();
            }
            navigate({
                to: "/pomodoro/$sessionId",
                params: { sessionId: String(data.id) },
                replace: true,
            });
        },
        onError: (error) => {
            toast.error(`Failed to save session: ${error.message}`);
        },
    });

    const { mutate: updateStatusMutation, isPending: isUpdatingStatus } =
        useMutation({
            mutationFn: async (request: UpdatePomodoroSessionRequest) => {
                const token = await getToken();
                if (!token) {
                    throw new Error("Authentication token not found.");
                }
                const success = await updateSessionStatus(request, token);
                if (!success) {
                    throw new Error(
                        "Failed to update session status on the server."
                    );
                }
                return { success, status: request.statusType };
            },
            onSuccess: (data, variables) => {
                toast.success(
                    `Session status updated to ${variables.statusType}.`
                );
                if (variables.statusType === "inprogress") {
                    setIsRunning(true);
                    if (countdownRef.current) {
                        countdownRef.current.start();
                    }
                } else if (variables.statusType === "paused") {
                    setIsRunning(false);
                    if (countdownRef.current) {
                        countdownRef.current.pause();
                    }
                }
            },
            onError: (error: Error) => {
                toast.error(`Failed to update status: ${error.message}`);
            },
        });

    const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
    const [mode, setMode] = useState<TimerMode>("pomodoro");
    const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60 * 1000);
    const [isRunning, setIsRunning] = useState(false);
    const [key, setKey] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const countdownRef = useRef<Countdown>(null);

    useEffect(() => {
        if (sessionQuery.data) {
            const session = sessionQuery.data;
            setCurrentSessionId(session.id);
            setSettings((prev) => ({
                ...prev,
                pomodoro: session.duration_minutes,
            }));
            setTimeLeft(session.duration_minutes * 60 * 1000);
            setIsRunning(session.status_type_id === "inprogress");
            setKey((prev) => prev + 1);
            if (
                session.status_type_id === "inprogress" &&
                countdownRef.current
            ) {
                setTimeout(() => countdownRef.current?.start(), 0);
            } else if (
                session.status_type_id === "paused" &&
                countdownRef.current
            ) {
                setTimeout(() => countdownRef.current?.pause(), 0);
            }
        }
    }, [sessionQuery.data]);

    useEffect(() => {
        if (sessionQuery.isError) {
            const error = sessionQuery.error as any;
            if (error?.response?.status === 404) {
                toast.error(
                    "Pomodoro session not found. Please start a new one."
                );
            } else {
                toast.error(
                    `Failed to load session: ${error?.message || "Unknown error"}`
                );
            }
            setCurrentSessionId(null);
            navigate({ to: "/pomodoro", replace: true });
            handleReset();
        }
    }, [sessionQuery.isError, sessionQuery.error, navigate]);

    useEffect(() => {
        if (
            !initialSessionId ||
            sessionQuery.isSuccess ||
            sessionQuery.isError
        ) {
            setIsRunning(false);
            setTimeLeft(settings[mode] * 60 * 1000);
            setKey((prevKey) => prevKey + 1);
        }
    }, [
        mode,
        settings,
        initialSessionId,
        sessionQuery.isSuccess,
        sessionQuery.isError,
    ]);

    const form = useForm({
        defaultValues: {
            userId: userId || "",
            startTime: new Date(),
            durationMinutes: settings.pomodoro,
            statusType: "inprogress" as PomodoroStatus,
            goal: null,
            calendarEventId: null,
            taskIds: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        onSubmit: async ({ value }) => {
            if (sessionQuery.isLoading) return;
            if (!userId) {
                toast.error("User not authenticated. Cannot save session.");
                return;
            }
            const request: CreatePomodoroSessionRequest = {
                userId: userId,
                startTime: new Date(),
                durationMinutes: settings[mode],
                statusType: "inprogress",
                goal: value.goal,
                calendarEventId: value.calendarEventId,
                taskIds: value.taskIds,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            createPomodoroSessionMutation(request);
        },
    });

    const handlePrimaryAction = () => {
        if (sessionQuery.isLoading) return;

        if (!currentSessionId && mode === "pomodoro") {
            form.handleSubmit();
        } else if (isRunning) {
            if (currentSessionId && userId && mode === "pomodoro") {
                updateStatusMutation({
                    sessionId: currentSessionId,
                    statusType: "paused",
                });
            } else if (mode !== "pomodoro" && countdownRef.current) {
                setIsRunning(false);
                countdownRef.current.pause();
            }
        } else {
            if (currentSessionId && userId && mode === "pomodoro") {
                updateStatusMutation({
                    sessionId: currentSessionId,
                    statusType: "inprogress",
                });
            } else if (countdownRef.current) {
                setIsRunning(true);
                countdownRef.current.start();
            }
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(settings[mode] * 60 * 1000);
        setKey((prevKey) => prevKey + 1);
        if (initialSessionId && currentSessionId) {
            // Or, we could offer to cancel/complete the current session via API
        }
    };

    const handleComplete = () => {
        setIsRunning(false);
        if (mode === "pomodoro" && currentSessionId && userId) {
            updateStatusMutation({
                sessionId: currentSessionId,
                statusType: "completed",
            });
        }
        if (onTimerComplete) {
            onTimerComplete();
        }
        handleReset();
    };

    const handleTick = ({ total }: { total: number }) => {
        setTimeLeft(total);
    };

    const updateSettings = (type: keyof TimerSettings, value: number) => {
        setSettings((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    const totalTime = settings[mode] * 60 * 1000;
    const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    const circumference = 2 * Math.PI * 45;

    const renderer = ({
        minutes,
        seconds,
        completed,
    }: {
        minutes: number;
        seconds: number;
        completed: boolean;
    }) => {
        if (sessionQuery.isLoading && initialSessionId) {
            return <div className="text-2xl font-bold">Loading Session...</div>;
        }
        if (completed) {
            return <div className="text-4xl font-bold">00:00</div>;
        }
        return (
            <div className="text-4xl font-bold">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
            </div>
        );
    };

    let primaryButtonText: string;
    let primaryButtonDisabled =
        isCreatingSession ||
        isUpdatingStatus ||
        form.state.isSubmitting ||
        sessionQuery.isLoading;

    if (sessionQuery.isLoading && initialSessionId) {
        primaryButtonText = "Loading...";
    } else if (!currentSessionId && mode === "pomodoro") {
        primaryButtonText = "Start New Session";
    } else if (isRunning) {
        primaryButtonText = "Pause";
    } else if (currentSessionId && !isRunning && mode === "pomodoro") {
        primaryButtonText = "Resume";
    } else {
        primaryButtonText = "Start";
    }

    return (
        <Card className="w-full bg-emerald/40 shadow-lg">
            <CardHeader>
                <Tabs
                    value={mode}
                    className="w-full"
                    onValueChange={(value) => {
                        if (!sessionQuery.isLoading) {
                            setMode(value as TimerMode);
                        }
                    }}
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="pomodoro"
                            className="flex items-center gap-1"
                            disabled={sessionQuery.isLoading}
                        >
                            <Brain className="w-4 h-4" />
                            <span>Focus</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="shortBreak"
                            className="flex items-center gap-1"
                            disabled={sessionQuery.isLoading}
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Short Break</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="longBreak"
                            className="flex items-center gap-1"
                            disabled={sessionQuery.isLoading}
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Long Break</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
                <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg
                        className="absolute w-full h-full"
                        viewBox="0 0 100 100"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                            stroke="transparent"
                            strokeWidth="5"
                            className="text-slate-200 dark:text-slate-700"
                        />
                    </svg>

                    <svg
                        className="absolute w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                            stroke="green"
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={
                                (circumference * (100 - progress)) / 100
                            }
                            strokeLinecap="round"
                            className="!text-emerald-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
                        />
                    </svg>

                    <div
                        className="z-10 flex flex-col items-center justify-center"
                        data-timer-debug="true"
                        data-time-left={timeLeft}
                        data-total-time={totalTime}
                        data-progress={progress}
                    >
                        <Countdown
                            key={key}
                            date={Date.now() + timeLeft}
                            renderer={renderer}
                            onComplete={handleComplete}
                            onTick={handleTick}
                            autoStart={false}
                            ref={countdownRef}
                        />
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            {mode === "pomodoro" ?
                                "Focus Time"
                            : mode === "shortBreak" ?
                                "Short Break"
                            :   "Long Break"}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="flex justify-center gap-2 w-full">
                    <Button
                        onClick={handlePrimaryAction}
                        variant={
                            isRunning && mode === "pomodoro" ?
                                "default"
                            :   "outline"
                        }
                        className={`flex items-center gap-1 min-w-[120px] justify-center ${isRunning && mode === "pomodoro" ? "bg-sage hover:bg-sage/80" : ""}`}
                        disabled={primaryButtonDisabled}
                    >
                        {sessionQuery.isLoading && initialSessionId ?
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        : isRunning ?
                            <Pause className="w-4 h-4" />
                        :   <Play className="w-4 h-4" />}
                        {(
                            isCreatingSession &&
                            primaryButtonText === "Start New Session"
                        ) ?
                            "Starting..."
                        : (
                            isUpdatingStatus &&
                            (primaryButtonText === "Pause" ||
                                primaryButtonText === "Resume")
                        ) ?
                            primaryButtonText === "Pause" ?
                                "Pausing..."
                            :   "Resuming..."
                        :   primaryButtonText}
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex items-center gap-1"
                        disabled={
                            isCreatingSession ||
                            isUpdatingStatus ||
                            sessionQuery.isLoading
                        }
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 w-full"
                >
                    {isSettingsOpen ? "Hide Settings" : "Adjust Timer Settings"}
                </Button>

                {isSettingsOpen && (
                    <div className="w-full space-y-4 pt-2 border-t">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">
                                    Focus Time: {settings.pomodoro} min
                                </span>
                            </div>
                            <Slider
                                value={[settings.pomodoro]}
                                min={1}
                                max={60}
                                step={1}
                                onValueChange={(value) =>
                                    updateSettings("pomodoro", value[0])
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">
                                    Short Break: {settings.shortBreak} min
                                </span>
                            </div>
                            <Slider
                                value={[settings.shortBreak]}
                                min={1}
                                max={30}
                                step={1}
                                onValueChange={(value) =>
                                    updateSettings("shortBreak", value[0])
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium">
                                    Long Break: {settings.longBreak} min
                                </span>
                            </div>
                            <Slider
                                value={[settings.longBreak]}
                                min={1}
                                max={60}
                                step={1}
                                onValueChange={(value) =>
                                    updateSettings("longBreak", value[0])
                                }
                                className="w-full"
                            />
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
