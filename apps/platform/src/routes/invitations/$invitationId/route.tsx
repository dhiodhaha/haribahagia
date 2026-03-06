import { createFileRoute, Outlet } from "@tanstack/react-router";
import { EditorLayout } from "@/domains/editor/components/editor-layout";

export const Route = createFileRoute("/invitations/$invitationId")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<EditorLayout>
			<Outlet />
		</EditorLayout>
	);
}
