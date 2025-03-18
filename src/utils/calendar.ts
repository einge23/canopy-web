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

// export const fetchPosts = createServerFn({ method: 'GET' }).handler(
//   async () => {
//     console.info('Fetching posts...')
//     await new Promise((r) => setTimeout(r, 1000))
//     return axios
//       .get<Array<PostType>>('https://jsonplaceholder.typicode.com/posts')
//       .then((r) => r.data.slice(0, 10))
//   },
// )
