import { GripVertical, Pencil } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface SectionCardProps {
	title: string;
	subtitle: string;
	icon: React.ReactNode;
	isActive?: boolean;
}

export function SectionCard({
	title,
	subtitle,
	icon,
	isActive = true,
}: SectionCardProps) {
	return (
		<div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors group">
			<Button className="cursor-grab text-gray-300 hover:text-gray-500">
				<GripVertical className="size-5" />
			</Button>

			<div className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg text-gray-500">
				{icon}
			</div>

			<div className="flex-1 min-w-0 text-left">
				<h3 className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">
					{title}
				</h3>
				<p className="text-sm text-gray-500 truncate">{subtitle}</p>
			</div>

			{/* Action buat edit/toogle */}
			<div className="flex items-center gap-4 pl-4 border-l border-gray-100 opacity-80 group-hover:opacity-100 transition-opacity">
				<Button className="text-gray-400 hover:text-gray-600 transition-colors">
					<Pencil className="size-4" />
				</Button>
				<Switch
					checked={isActive}
					className="data-[state=checked]:bg-teal-800"
				/>
			</div>
		</div>
	);
}
