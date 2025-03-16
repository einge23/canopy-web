import { Button } from "../ui/button";

export default function StyledButton({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Button
            className="bg-gradient-to-b from-emerald to-emerald/65 
                     font-bold text-white shadow-sm 
                     hover:from-emerald/65 hover:to-emerald/90
                     hover:shadow-md transition-all duration-400 
                     [text-shadow:_0_1px_1px_rgb(0_0_0_/_20%)]"
        >
            {children}
        </Button>
    );
}
