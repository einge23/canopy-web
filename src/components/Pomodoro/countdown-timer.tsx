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
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface TimerSettings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
}

export default function PomodoroTimer({
    onTimerComplete,
}: {
    onTimerComplete?: () => void;
}) {
    // Default timer durations in minutes
    const defaultSettings: TimerSettings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
    };

    const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
    const [mode, setMode] = useState<TimerMode>("pomodoro");
    const [timeLeft, setTimeLeft] = useState(settings[mode] * 60 * 1000);
    const [isRunning, setIsRunning] = useState(false);
    const [key, setKey] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const countdownRef = useRef<Countdown>(null);

    // Update timer when mode changes
    useEffect(() => {
        handleReset();
    }, [mode, settings]);

    const handleStart = () => {
        setIsRunning(true);
        if (countdownRef.current) {
            countdownRef.current.start();
        }
    };

    const handlePause = () => {
        setIsRunning(false);
        if (countdownRef.current) {
            countdownRef.current.pause();
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(settings[mode] * 60 * 1000);
        setKey((prevKey) => prevKey + 1);
    };

    const handleComplete = () => {
        // Play sound or notification here
        setIsRunning(false);
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

    // Calculate progress for the circular timer
    const totalTime = settings[mode] * 60 * 1000;
    const progress = (timeLeft / totalTime) * 100;
    const circumference = 2 * Math.PI * 45; // 45 is the radius of the circle

    // Format time for display
    const renderer = ({
        minutes,
        seconds,
        completed,
    }: {
        minutes: number;
        seconds: number;
        completed: boolean;
    }) => {
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

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="pb-2">
                <CardTitle className="text-center text-2xl font-bold">
                    Pomodoro Timer
                </CardTitle>
                <Tabs
                    defaultValue="pomodoro"
                    className="w-full"
                    onValueChange={(value) => setMode(value as TimerMode)}
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                            value="pomodoro"
                            className="flex items-center gap-1"
                        >
                            <Brain className="w-4 h-4" />
                            <span>Focus</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="shortBreak"
                            className="flex items-center gap-1"
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Short Break</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="longBreak"
                            className="flex items-center gap-1"
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Long Break</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                <div className="relative w-56 h-56 flex items-center justify-center">
                    {/* Circular progress background */}
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

                    {/* Timer display */}
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
                            autoStart={isRunning}
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
                    {!isRunning ?
                        <Button
                            onClick={handleStart}
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <Play className="w-4 h-4" />
                            Start
                        </Button>
                    :   <Button
                            onClick={handlePause}
                            className="flex items-center gap-1 bg-sage hover:bg-sage/80"
                        >
                            <Pause className="w-4 h-4" />
                            Pause
                        </Button>
                    }
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex items-center gap-1"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </Button>
                </div>

                <Button
                    variant="ghost"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
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
