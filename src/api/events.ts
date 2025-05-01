import {
    CalendarEvent,
    CreateEventRequest,
    EditEventRequest,
} from "~/models/events";
import { api, getAuthenticatedApi } from "./api-base";
import https from "https";

export interface getUserEventsByDateRequest {
    user_id: string;
    date: Date;
}

export async function createEvent(request: CreateEventRequest, token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.post<CalendarEvent>(
        "/events/create",
        request
    );
    return response.data;
}

export async function getMonthlyEvents(
    token: string,
    month: number,
    year: number
) {
    const authApi = getAuthenticatedApi(token);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await authApi.get<CalendarEvent[]>(
        `/events?month=${month + 1}&year=${year}&timezone=${encodeURIComponent(timezone)}`
    );
    return response.data;
}

export async function editEvent(request: EditEventRequest, token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.put<CalendarEvent>(`/events/edit`, request);
    return response.data;
}
