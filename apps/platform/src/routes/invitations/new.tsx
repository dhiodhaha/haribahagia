import { createFileRoute, Outlet } from "@tanstack/react-router";
import { EditorLayout } from "@/domains/editor/components/editor-layout";
export const Route = createFileRoute("/invitations/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<EditorLayout>
			<Outlet />
		</EditorLayout>
	);
}
