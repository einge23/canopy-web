import axios from "axios";
const env = process.env.NODE_ENV || "development";
const baseURL =
    env === "production" ?
        import.meta.env.VITE_CANOPY_API_URL
    :   "http://localhost:5172/api";

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
