import { useAuth, useUser } from "@clerk/tanstack-start";
import { getAuth } from "@clerk/tanstack-start/server";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { createEvent } from "~/api/events";
import { CalendarEvent, CreateEventRequest } from "~/models/events";

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
        const eventDate = new Date(event.startTime);
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
    return events.filter((event) => {
        console.log("event", event.startTime);
        const eventDate = new Date(event.startTime);
        console.log("eventDate", eventDate);
        const eventMonth = eventDate.getMonth();
        const eventYear = eventDate.getFullYear();

        return eventMonth === month && eventYear === year;
    });
};

interface MonthlyEventsParams {
    month: number;
    year: number;
}

export const createNewEvent = createServerFn({ method: "POST" })
    .validator((params: unknown): CreateEventRequest => {
        // Validate that params is an object
        if (typeof params !== "object" || params === null) {
            throw new Error("Parameters must be an object");
        }

        // Check that all required fields are present
        const p = params as any;

        if (!("name" in p) || typeof p.name !== "string") {
            throw new Error("name parameter must be a string");
        }

        if (!("userId" in p) || typeof p.userId !== "string") {
            throw new Error("userId parameter must be a string");
        }

        if (!("color" in p) || typeof p.color !== "string") {
            throw new Error("color parameter must be a string");
        }

        return {
            name: p.name,
            startTime: p.startTime,
            endTime: p.endTime,
            location: p.location,
            description: p.description,
            userId: p.userId,
            color: p.color,
            recurrence_rule: p.recurrence_rule,
        } as CreateEventRequest;
    })
    .handler(async ({ data }): Promise<CalendarEvent> => {
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
        console.log("Creating event with data:", data);
        console.log("Token:", token);
        const newEvent = await createEvent(data, token);

        return newEvent;
    });

// Pre-defined constant array of all time options (96 values - 24 hours × 4 quarters)
export const ALL_TIME_OPTIONS = [
    { value: "00:00", label: "12:00 AM" },
    { value: "00:15", label: "12:15 AM" },
    { value: "00:30", label: "12:30 AM" },
    { value: "00:45", label: "12:45 AM" },
    { value: "01:00", label: "1:00 AM" },
    { value: "01:15", label: "1:15 AM" },
    { value: "01:30", label: "1:30 AM" },
    { value: "01:45", label: "1:45 AM" },
    { value: "02:00", label: "2:00 AM" },
    { value: "02:15", label: "2:15 AM" },
    { value: "02:30", label: "2:30 AM" },
    { value: "02:45", label: "2:45 AM" },
    { value: "03:00", label: "3:00 AM" },
    { value: "03:15", label: "3:15 AM" },
    { value: "03:30", label: "3:30 AM" },
    { value: "03:45", label: "3:45 AM" },
    { value: "04:00", label: "4:00 AM" },
    { value: "04:15", label: "4:15 AM" },
    { value: "04:30", label: "4:30 AM" },
    { value: "04:45", label: "4:45 AM" },
    { value: "05:00", label: "5:00 AM" },
    { value: "05:15", label: "5:15 AM" },
    { value: "05:30", label: "5:30 AM" },
    { value: "05:45", label: "5:45 AM" },
    { value: "06:00", label: "6:00 AM" },
    { value: "06:15", label: "6:15 AM" },
    { value: "06:30", label: "6:30 AM" },
    { value: "06:45", label: "6:45 AM" },
    { value: "07:00", label: "7:00 AM" },
    { value: "07:15", label: "7:15 AM" },
    { value: "07:30", label: "7:30 AM" },
    { value: "07:45", label: "7:45 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "08:15", label: "8:15 AM" },
    { value: "08:30", label: "8:30 AM" },
    { value: "08:45", label: "8:45 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "09:15", label: "9:15 AM" },
    { value: "09:30", label: "9:30 AM" },
    { value: "09:45", label: "9:45 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "10:15", label: "10:15 AM" },
    { value: "10:30", label: "10:30 AM" },
    { value: "10:45", label: "10:45 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "11:15", label: "11:15 AM" },
    { value: "11:30", label: "11:30 AM" },
    { value: "11:45", label: "11:45 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "12:15", label: "12:15 PM" },
    { value: "12:30", label: "12:30 PM" },
    { value: "12:45", label: "12:45 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "13:15", label: "1:15 PM" },
    { value: "13:30", label: "1:30 PM" },
    { value: "13:45", label: "1:45 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "14:15", label: "2:15 PM" },
    { value: "14:30", label: "2:30 PM" },
    { value: "14:45", label: "2:45 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "15:15", label: "3:15 PM" },
    { value: "15:30", label: "3:30 PM" },
    { value: "15:45", label: "3:45 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "16:15", label: "4:15 PM" },
    { value: "16:30", label: "4:30 PM" },
    { value: "16:45", label: "4:45 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "17:15", label: "5:15 PM" },
    { value: "17:30", label: "5:30 PM" },
    { value: "17:45", label: "5:45 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "18:15", label: "6:15 PM" },
    { value: "18:30", label: "6:30 PM" },
    { value: "18:45", label: "6:45 PM" },
    { value: "19:00", label: "7:00 PM" },
    { value: "19:15", label: "7:15 PM" },
    { value: "19:30", label: "7:30 PM" },
    { value: "19:45", label: "7:45 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "20:15", label: "8:15 PM" },
    { value: "20:30", label: "8:30 PM" },
    { value: "20:45", label: "8:45 PM" },
    { value: "21:00", label: "9:00 PM" },
    { value: "21:15", label: "9:15 PM" },
    { value: "21:30", label: "9:30 PM" },
    { value: "21:45", label: "9:45 PM" },
    { value: "22:00", label: "10:00 PM" },
    { value: "22:15", label: "10:15 PM" },
    { value: "22:30", label: "10:30 PM" },
    { value: "22:45", label: "10:45 PM" },
    { value: "23:00", label: "11:00 PM" },
    { value: "23:15", label: "11:15 PM" },
    { value: "23:30", label: "11:30 PM" },
    { value: "23:45", label: "11:45 PM" },
];

// Simple function to filter time options starting from a specific time
export function getTimeOptionsStartingFrom(startDate: Date) {
    const startHour = startDate.getHours();
    const startMinute = Math.floor(startDate.getMinutes() / 15) * 15;
    const startIndex = startHour * 4 + startMinute / 15;

    return ALL_TIME_OPTIONS.slice(startIndex);
}
