import { Link } from "@tanstack/react-router";
import {
    BarChart2,
    Box,
    ChevronDown,
    LayoutList,
    Mail,
    Palette,
    Settings,
    Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// NAVIGATION DATA
const data = {
    user: {
        name: "Alex Smith",
        plan: "Pro Plan",
        avatar: "https://i.pravatar.cc/150?u=alex",
    },
    project: {
        name: "Alex Smith's Bday",
        type: "Birthday Party",
    },
    navGroups: [
        {
            label: "EDITOR",
            items: [
                {
                    title: "Theme & Colors",
                    url: "/invitations/$invitationId/theme",
                    icon: Palette,
                },
                {
                    title: "Sections",
                    url: "/invitations/$invitationId/sections",
                    icon: LayoutList,
                },
                {
                    title: "Settings",
                    url: "/invitations/$invitationId/settings",
                    icon: Settings,
                },
            ],
        },
        {
            label: "MANAGEMENT",
            items: [
                {
                    title: "Guests",
                    url: "/invitations/$invitationId/guests",
                    icon: Users,
                },
                {
                    title: "RSVP",
                    url: "/invitations/$invitationId/rsvp",
                    icon: Mail,
                },
                {
                    title: "Analytics",
                    url: "/invitations/$invitationId/analytics",
                    icon: BarChart2,
                },
            ],
        },
    ],
};

export function EditorSidebar() {
    return (
        <Sidebar className="border-r border-gray-200 font-sans">
            <SidebarHeader className="pt-5 px-4 pb-2">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="size-8 bg-[#111827] text-white rounded-md flex items-center justify-center font-bold text-lg">
                        H
                    </div>
                    <span className="font-bold text-lg text-gray-900">
                        haribahagia
                    </span>
                </div>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="hover:bg-gray-100 p-2 rounded-lg data-[state=open]:bg-gray-100"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm">
                                <Box className="size-4 text-gray-500" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                <span className="truncate font-semibold text-gray-900">
                                    {data.project.name}
                                </span>
                                <span className="truncate text-xs text-gray-500">
                                    {data.project.type}
                                </span>
                            </div>
                            <ChevronDown className="ml-auto size-4 text-gray-400" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 mt-4 space-y-4">
                {data.navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="text-xs font-semibold text-gray-400 tracking-wider">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className="py-2 text-gray-600 font-medium text-sm hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            <Link
                                                to={item.url}
                                                activeProps={{
                                                    className:
                                                        "bg-gray-100 text-gray-900 font-semibold",
                                                }}
                                            >
                                                <item.icon className="mr-2 size-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-gray-200">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="hover:bg-gray-50 p-2 rounded-md"
                        >
                            <Avatar className="size-8 rounded-full">
                                <AvatarImage
                                    src={data.user.avatar}
                                    alt={data.user.name}
                                />
                                <AvatarFallback className="rounded-lg">
                                    AS
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                <span className="truncate font-semibold text-gray-900 text-sm">
                                    {data.user.name}
                                </span>
                                <span className="truncate text-xs text-gray-500">
                                    {data.user.plan}
                                </span>
                            </div>
                            <Settings className="ml-auto size-4 text-gray-400" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
