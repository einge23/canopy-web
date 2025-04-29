export interface CalendarEvent {
    id: number;
    name: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    description?: string;
    user_id: string;
    color: string;
    recurrence_rule?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateEventRequest {
    userId: string;
    name: string;
    color: string;
    startTime: Date;
    endTime: Date;
    recurrenceRule?: string;
    location?: string;
    description?: string;
}
