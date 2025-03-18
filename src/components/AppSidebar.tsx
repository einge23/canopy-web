import { Calendar, Home, Inbox, Leaf, Search, Settings } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
// import { Separator } from "@/components/ui/separator";

// // Menu items.
// const items = [
//     {
//         title: "Home",
//         url: "#",
//         icon: Home,
//     },
//     {
//         title: "Inbox",
//         url: "#",
//         icon: Inbox,
//     },
//     {
//         title: "Calendar",
//         url: "#",
//         icon: Calendar,
//     },
//     {
//         title: "Search",
//         url: "#",
//         icon: Search,
//     },
//     {
//         title: "Settings",
//         url: "#",
//         icon: Settings,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="font-bold text-xl flex justify-center items-center gap-3 h-[52px]">
                        <Leaf className="h-7 w-7" /> canopy
                    </SidebarGroupLabel>
                    <hr className="mx-4 my-2" />
                    <SidebarGroupContent className="mt-2">
                        <SidebarMenu>
                            <SidebarMenuItem className="rounded-md hover:bg-accent">
                                <SidebarMenuButton>
                                    <Home className="h-5 w-5" /> Home
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
