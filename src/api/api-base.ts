import axios from "redaxios";

const baseURL = import.meta.env.VITE_CANOPY_API_URL || "http://localhost:3000";

// Create a function to get a configured API instance with auth
export const getAuthenticatedApi = (token: string) => {
    // Clone the api instance
    const authenticatedApi = axios.create({
        withCredentials: true,
        baseURL: baseURL,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
            Host: "canopy-api-production.up.railway.app",
            Connection: "keep-alive",
            "Accept-Encoding": "gzip, deflate, br",
            "User-Agent": "Canopy Client",
            "Sec-Fetch-Dest": "https://canopy-api-production.up.railway.app",
        },
    });

    return authenticatedApi;
};

export const api = axios.create({
    baseURL: baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});
