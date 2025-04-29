import axios from "axios";

const baseURL = import.meta.env.VITE_CANOPY_API_URL!;

// Create a function to get a configured API instance with auth
export const api = axios.create({
    baseURL: baseURL,
});

export function getAuthenticatedApi(token: string) {
    return axios.create({
        baseURL: baseURL,
        headers: { Authorization: `Bearer ${token}` },
    });
}
