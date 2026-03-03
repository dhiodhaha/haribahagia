import { EditorLayout } from "@/domains/editor/components/editor-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/invitations/new")({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <EditorLayout>
        <Outlet />
      </EditorLayout>
    </>
  );
}
