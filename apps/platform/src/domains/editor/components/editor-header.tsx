import { Share2, Upload } from "lucide-react";
import { Button } from "@/components/ui//button";

export function EditorHeader() {
    return (
        <header className="h-22 px-8 flex items-center justify-between border-b border-gray-200 bg-white font-sans shrink-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Section Manager
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Build your perfect birthday invitation.
                </p>
            </div>

            <div className="flex items-center gap-5">
                <span className="text-sm text-gray-400 font-medium">
                    Last saved just now
                </span>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="h-9 px-4 text-sm font-semibold text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm"
                    >
                        <Share2 className="mr-2 size-4 text-gray-500" />
                        Share
                    </Button>

                    <Button className="h-9 px-4 text-sm font-semibold bg-teal-700 hover:bg-teal-700 text-white shadow-sm">
                        <Upload className="mr-2 size-4" />
                        Publish
                    </Button>
                </div>
            </div>
        </header>
    );
}
