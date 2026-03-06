import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorHeader } from "./editor-header";
import { EditorSidebar } from "./editor-sidebar";

interface EditorLayoutProps {
	children: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full bg-[#F9FAFB]">
				<EditorSidebar />

				<main className="flex-1 flex flex-col min-w-0">
					<EditorHeader /> {/* Header nempel di atas */}
					{/* Konten dinamis seperti section list atau setting tema  bakalan masuk sini */}
					<div className="flex-1 overflow-auto">{children}</div>
				</main>
			</div>
		</SidebarProvider>
	);
}
