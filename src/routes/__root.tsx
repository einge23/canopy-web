/// <reference types="vite/client" />
import "@fontsource/comfortaa/300.css"; // Light
import "@fontsource/comfortaa/400.css"; // Regular
import "@fontsource/comfortaa/500.css"; // Medium
import "@fontsource/comfortaa/600.css"; // SemiBold
import "@fontsource/comfortaa/700.css"; // Bold
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/tanstack-start";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import * as React from "react";
import { getAuth } from "@clerk/tanstack-start/server";
import { getWebRequest } from "@tanstack/react-start/server";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js";
import { NotFound } from "~/components/NotFound.js";
import appCss from "~/styles/app.css?url";
import globalsCss from "~/styles/globals.css?url";
import Navbar from "~/components/Navbar/Navbar";
import { AppSidebar } from "~/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { CalendarProvider } from "~/contexts/CalendarContext";

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
    const { userId } = await getAuth(getWebRequest()!);

    return {
        userId,
    };
});

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
        ],
        links: [
            { rel: "stylesheet", href: appCss, suppressHydrationWarning: true },
            {
                rel: "stylesheet",
                href: globalsCss,
                suppressHydrationWarning: true,
            },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossOrigin: "anonymous",
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap",
            },
            {
                rel: "apple-touch-icon",
                sizes: "180x180",
                href: "/apple-touch-icon.png",
            },
            {
                rel: "icon",
                type: "image/png",
                sizes: "32x32",
                href: "/favicon-32x32.png",
            },
            {
                rel: "icon",
                type: "image/png",
                sizes: "16x16",
                href: "/favicon-16x16.png",
            },
            { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
            { rel: "icon", href: "/favicon.ico" },
        ],
    }),
    beforeLoad: async () => {
        const { userId } = await fetchClerkAuth();

        return {
            userId,
        };
    },
    errorComponent: (props) => {
        return (
            <RootDocument>
                <DefaultCatchBoundary {...props} />
            </RootDocument>
        );
    },
    notFoundComponent: () => <NotFound />,
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <ClerkProvider>
                <CalendarProvider>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className="flex flex-col">
                            <Navbar />
                            <hr />
                            <main className="flex-1 bg-gradient-to-b from-background to-teal/80">
                                <Outlet />
                            </main>
                            <TanStackRouterDevtools position="bottom-right" />
                        </SidebarInset>
                    </SidebarProvider>
                </CalendarProvider>
            </ClerkProvider>
        </RootDocument>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning>
            <head suppressHydrationWarning>
                <HeadContent />
            </head>
            <body className="bg-gradient-to-b from-background to-teal/80">
                {children}
                <Scripts />
            </body>
        </html>
    );
}
