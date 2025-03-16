import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <div className="p-2">
            <h1>Hello Canopy</h1>
            <Button>Click me</Button>
        </div>
    );
}
