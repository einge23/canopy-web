import { Search } from "lucide-react";
import { Input } from "../ui/input";

export default function StyledInput({
    placeholder = "Search Events...",
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="relative group">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-[1]">
                <Search className="h-4 w-4 text-white/70" />
            </div>
            <Input
                {...props}
                placeholder={placeholder}
                className="w-[200px] bg-gradient-to-b from-navy/85 to-navy 
                    border-navy/30 text-white placeholder:text-white/50
                    focus:border-navy/50 focus:from-navy/90 focus:to-navy/95
                    focus:ring-1 focus:ring-navy/30 focus:shadow-[0_0_15px_rgba(47,72,88,0.15)]
                    transition-all duration-300 ease-out
                    rounded-lg pl-10 pr-4 py-2"
            />
            <div
                className="absolute inset-0 -z-10 rounded-lg 
                    bg-gradient-to-tr from-navy/40 via-transparent to-navy/40 
                    opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                    blur-md transition-all duration-500"
            />
        </div>
    );
}
