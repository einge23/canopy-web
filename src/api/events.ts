import { CalendarEvent, CreateEventRequest } from "~/models/events";
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

export async function getUserEventsByDate(
    request: getUserEventsByDateRequest,
    token: string
) {
    const authApi = getAuthenticatedApi(token);

    const response = await authApi.get<CalendarEvent[]>(
        `/events/daily/${request.user_id}/${request.date.toISOString()}`
    );
    return response.data;
}

// Add function for getting all user events
export async function getUserEvents(userId: string, token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.get<CalendarEvent[]>(
        `/events/user/${userId}`
    );
    return response.data;
}

// Add function for editing events
export async function editEvent(event: CalendarEvent, token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.put<CalendarEvent>("/events/edit", event);
    return response.data;
}

export async function deleteEvent(eventId: number, token: string) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.delete<CalendarEvent>(`/events/${eventId}`);
    return response.data;
}

export async function getEventsByMonth(
    userId: string,
    month: number,
    year: number,
    token: string
) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.get<CalendarEvent[]>(
        `/events/monthly/${userId}/${year}/${month + 1}`
    );
    console.log(response.data);
    return response.data;
}
