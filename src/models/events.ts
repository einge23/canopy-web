export interface CalendarEvent {
    id: number;
    name: string;
    start: string; // ISO date string
    end: string; // ISO date string
    location: string;
    description: string;
    user_id: number;
    color: string;
    recurrence_rule?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateEventRequest {
    name: string;
    start: Date;
    end: Date;
    location?: string;
    description?: string;
    user_id: string;
    color: string;
    recurrence_rule?: string;
}
