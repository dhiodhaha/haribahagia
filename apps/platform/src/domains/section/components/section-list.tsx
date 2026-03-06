import {
	CheckCircle2,
	Clock,
	Gift,
	Image as ImageIcon,
	PartyPopper,
	Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "./section-card";

const sectionsData = [
	{
		id: "party-intro",
		title: "Party Intro",
		subtitle: "Hero image, headline & welcome message",
		icon: <PartyPopper className="w-5 h-5" />,
		isActive: true,
	},
	{
		id: "time-location",
		title: "Time & Location",
		subtitle: "When & where the fun happens",
		icon: <Clock className="w-5 h-5" />,
		isActive: true,
	},
	{
		id: "gift-registry",
		title: "Gift Registry",
		subtitle: "Wishlist links & gift preferences",
		icon: <Gift className="w-5 h-5" />,
		isActive: true,
	},
	{
		id: "photo-wall",
		title: "Photo Wall",
		subtitle: "Fun memories gallery",
		icon: <ImageIcon className="w-5 h-5" />,
		isActive: true,
	},
	{
		id: "rsvp",
		title: "RSVP",
		subtitle: "Count me in!",
		icon: <CheckCircle2 className="w-5 h-5" />,
		isActive: true,
	},
];

export function SectionList() {
	return (
		<div className="max-w-3xl w-full mx-auto py-8 px-6 font-sans">
			<div className="space-y-4 mb-6">
				{sectionsData.map((section) => (
					<SectionCard
						key={section.id}
						title={section.title}
						subtitle={section.subtitle}
						icon={section.icon}
						isActive={section.isActive}
					/>
				))}
			</div>

			<Button className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50/50 transition-all text-[15px]">
				<Plus className="w-5 h-5" />
				Add New Section
			</Button>
		</div>
	);
}
