import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PrivacyTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-amber-400/70 cursor-help inline-block ml-1" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs bg-zinc-900 text-white border-zinc-700 p-3">
          <p style={{ textTransform: "none", letterSpacing: "normal" }}>
            This amount is <strong>private to you</strong>. Only the total platform-aggregated amount is visible to the public to measure our collective impact. How much money you made is your business — we believe that's private.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
