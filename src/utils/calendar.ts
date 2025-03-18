import { useAuth, useUser } from "@clerk/tanstack-start";
import { getAuth } from "@clerk/tanstack-start/server";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import axios from "redaxios";
import { getEventsByMonth } from "~/api/events";
import { CalendarEvent } from "~/models/events";

export const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getDaysInFebruary = (
    year: number = new Date().getFullYear()
): number => {
    return isLeapYear(year) ? 29 : 28;
};

export type Month = {
    id: number;
    name: string;
    days: number;
};

export const Months: Month[] = [
    {
        id: 1,
        name: "January",
        days: 31,
    },
    {
        id: 2,
        name: "February",
        days: getDaysInFebruary(),
    },
    {
        id: 3,
        name: "March",
        days: 31,
    },
    {
        id: 4,
        name: "April",
        days: 30,
    },
    {
        id: 5,
        name: "May",
        days: 31,
    },
    {
        id: 6,
        name: "June",
        days: 30,
    },
    {
        id: 7,
        name: "July",
        days: 31,
    },
    {
        id: 8,
        name: "August",
        days: 31,
    },
    {
        id: 9,
        name: "September",
        days: 30,
    },
    {
        id: 10,
        name: "October",
        days: 31,
    },
    {
        id: 11,
        name: "November",
        days: 30,
    },
    {
        id: 12,
        name: "December",
        days: 31,
    },
];

export const isToday = (date: Date) => {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

export const filterEventsForDate = (date: Date, events: CalendarEvent[]) => {
    if (!events || events.length === 0) return [];

    return events.filter((event) => {
        const eventDate = new Date(event.start);
        return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
        );
    });
};

export const isSelected = (date: Date, selectedDate: Date) => {
    return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
    );
};

export const getCurrentTimeIndicatorStyles = (date: Date) => {
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    const percentage = (minutesSinceMidnight / 1440) * 100; // 1440 = minutes in a day

    return {
        top: `${percentage}%`,
        left: -4.25,
        right: 0,
        position: "absolute" as const,
    };
};

export const filterEventsForMonth = (
    events: CalendarEvent[],
    month: number,
    year: number
) => {
    return events.filter(
        (event) =>
            new Date(event.start).getMonth() === month &&
            new Date(event.start).getFullYear() === year
    );
};

interface MonthlyEventsParams {
    month: number;
    year: number;
}

export const getMonthlyEvents = createServerFn({ method: "GET" })
    .validator((params: unknown): MonthlyEventsParams => {
        // Validate that params is an object
        if (typeof params !== "object" || params === null) {
            throw new Error("Parameters must be an object");
        }

        // Check that month and year exist and are of the right type
        const p = params as any;

        if (!("month" in p) || typeof p.month !== "number") {
            throw new Error("month parameter must be a number");
        }

        if (p.month < 0 || p.month > 11) {
            throw new Error("month must be between 0 and 11");
        }

        if (!("year" in p) || typeof p.year !== "number") {
            throw new Error("year parameter must be a number");
        }

        if (p.year < 1900 || p.year > 2100) {
            throw new Error("year must be between 1900 and 2100");
        }

        return {
            month: p.month,
            year: p.year,
        };
    })
    .handler(async ({ data }): Promise<CalendarEvent[]> => {
        const { month, year } = data;

        // This part is correct - getting auth info on the server
        const request = getWebRequest();
        if (!request) {
            throw new Error("Request not found");
        }
        const auth = await getAuth(request);

        const userId = auth.userId;
        const token = await auth.getToken();

        if (!auth || !userId || !token) {
            throw new Error("User not authenticated");
        }

        // Get events for the specified month and year
        const events = await getEventsByMonth(userId, month, year, token);

        return events;
    });
// import { notFound } from '@tanstack/react-router'
// import { createServerFn } from '@tanstack/react-start'
// import axios from 'redaxios'

// export type PostType = {
//   id: string
//   title: string
//   body: string
// }

// export const fetchPost = createServerFn({ method: 'GET' })
//   .validator((postId: string) => postId)
//   .handler(async ({ data }) => {
//     console.info(`Fetching post with id ${data}...`)
//     const post = await axios
//       .get<PostType>(`https://jsonplaceholder.typicode.com/posts/${data}`)
//       .then((r) => r.data)
//       .catch((err) => {
//         console.error(err)
//         if (err.status === 404) {
//           throw notFound()
//         }
//         throw err
//       })

//     return post
//   })
