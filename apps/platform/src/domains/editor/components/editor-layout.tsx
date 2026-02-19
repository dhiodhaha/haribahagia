import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorSidebar } from "./editor-sidebar";

interface EditorLayoutProps {
  children: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F9FAFB]">
        <EditorSidebar />

        {/* Kolom tengah & kanan (Preview) akan masuk di children ini */}
        <main className="flex-1 flex flex-col min-w-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
