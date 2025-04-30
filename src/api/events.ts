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

export async function getCurrentMonthEvents(token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.get<CalendarEvent[]>(`/events/currentMonth`);
    return response.data;
}

export async function editEvent(request: EditEventRequest, token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.put<CalendarEvent>(`/events/edit`, request);
    return response.data;
}
