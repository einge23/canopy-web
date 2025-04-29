import axios from "axios";
const env = process.env.NODE_ENV || "development";
const baseURL = import.meta.env.VITE_CANOPY_API_URL;

export const api = axios.create({
    baseURL: baseURL,
});

export function getAuthenticatedApi(token: string) {
    return axios.create({
        baseURL: baseURL,
        headers: { Authorization: `Bearer ${token}` },
    });
}
