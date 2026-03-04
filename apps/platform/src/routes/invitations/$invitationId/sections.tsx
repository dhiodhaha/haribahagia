import { createFileRoute } from "@tanstack/react-router";
import { SectionList } from "@/domains/section/components/section-list";

export const Route = createFileRoute("/invitations/$invitationId/sections")({
	component: SectionsPage,
});

function SectionsPage() {
	return (
		// Container mengisi <Outlet /> yg ada di editor-layout.tsx
		<div className="flex w-full h-[calc(100vh-88px)] bg-slate-50">
			{/*Kolom Kiri: Area Section List yg Scrollable */}
			<div className="flex-1 overflow-y-auto border-r border-gray-200 p-6">
				<div className="max-w-3xl mx-auto">
					<SectionList />
				</div>
			</div>
			{/* Kolom Kanan: Placeholder buat Live Preview/Device Frame */}
			<div className="w-112.5 bg-gray-50 hidden lg:flex flex-col items-center justify-center border-l border-gray-200">
				{/* komponen PreviewPanel masuk sini */}
				<div className="text-center">
					<p className="text-sm font-medium text-gray-400 mb-2">LIVE PREVIEW</p>
					<div className="w-75 h-150 border-4 border-dashed border-gray-200 rounded-[2.5rem] flex items-center justify-center">
						<span className="text-gray-400 text-sm">Device Frame Here</span>
					</div>
				</div>
			</div>
		</div>
	);
}
