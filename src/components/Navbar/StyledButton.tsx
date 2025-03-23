import { Button } from "../ui/button";
import { cn } from "@/lib/utils"; // Import the cn utility for class name merging
import { Loader2 } from "lucide-react"; // Import a loader icon

export default function StyledButton({
    children,
    onClick,
    className,
    isLoading = false,
    disabled,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    isLoading?: boolean;
    disabled?: boolean;
}) {
    return (
        <Button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={cn(
                "bg-gradient-to-b from-emerald to-emerald/65 font-bold text-white shadow-sm hover:from-emerald/65 hover:to-emerald/90 hover:shadow-md transition-all duration-400 [text-shadow:_0_1px_1px_rgb(0_0_0_/_20%)]",
                className
            )}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    );
}
