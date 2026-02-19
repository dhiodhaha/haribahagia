import { GearIcon, PencilIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/invitations/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<aside className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col font-sans text-sm">
			<div>Hari Bahagia</div>
			<div className="flex flex-col h-min flex-start">
				<div>
					<div>Editor</div>
					<div className="flex flex-col">
						<Button variant="ghost">Theme and Colors</Button>
						<Button variant="ghost">
							<PencilIcon size={32} />
							Sections
						</Button>
						<Button variant="ghost">
							<GearIcon size={32} weight="bold" /> Settings
						</Button>
					</div>
				</div>
				<div>
					<div>Management</div>
					<div className="flex flex-col">
						<Button variant="ghost" disabled>
							Guests
						</Button>
						<Button variant="ghost" disabled>
							RSVP
						</Button>
						<Button variant="ghost" disabled>
							Analytics
						</Button>
					</div>
				</div>
			</div>
			<div>
				<div>Nama Pengguna</div>
				<div>Plan Pengguna</div>
			</div>
		</aside>
	);
}
