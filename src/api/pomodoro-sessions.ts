import {
    CreatePomodoroSessionRequest,
    PomodoroSession,
    UpdatePomodoroSessionRequest,
} from "~/models/pomodoro/sessions";
import { getAuthenticatedApi } from "./api-base";

export async function createPomodoroSession(
    request: CreatePomodoroSessionRequest,
    token: string
) {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.post<PomodoroSession>(
        "/pomodoro-sessions/create",
        request
    );
    return response.data;
}

export async function updateSessionStatus(
    { sessionId, statusType }: UpdatePomodoroSessionRequest,
    token: string
): Promise<boolean> {
    const authApi = getAuthenticatedApi(token);
    const response = await authApi.put<PomodoroSession>(
        `/pomodoro-sessions/${sessionId}/status`,
        { statusType }
    );
    return response.status === 204;
}
