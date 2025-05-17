export interface CreatePomodoroSessionRequest {
    userId: string;
    startTime: Date;
    durationMinutes: number;
    statusType: PomodoroStatus;
    goal: string | null;
    calendarEventId: number | null;
    taskIds: number[] | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdatePomodoroSessionRequest {
    statusType: PomodoroStatus;
    sessionId: number;
}

export interface PomodoroSession {
    id: number;
    user_id: string;
    start_time: Date;
    end_time: Date;
    duration_minutes: number;
    status_type_id: PomodoroStatus;
    goal: string | null;
    calendar_event_id: number | null;
    task_ids: number[] | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    completed_focus_cycles: number | null;
    completed_short_break_cycles: number | null;
    completed_long_break_cycles: number | null;
}

export type PomodoroStatus = "completed" | "inprogress" | "paused";
