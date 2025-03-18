import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/tanstack-start";
import { getEventsByMonth } from "~/api/events";

export function useMonthlyEvents(month: number, year: number) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const userId = user?.id;

    return useQuery({
        queryKey: ["events", "monthly", userId, year, month],
        queryFn: async () => {
            if (!userId) throw new Error("User not authenticated");

            const token = await getToken();
            if (!token) throw new Error("Unable to get authentication token");

            return getEventsByMonth(userId, month, year, token);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
}
