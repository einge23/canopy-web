import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tasks() {
    return (
        <Card className="w-full h-full bg-emerald/40 shadow-lg flex flex-col flex-1 min-h-0">
            <CardHeader className="shrink-0">
                <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
                <p>Task management features coming soon!</p>
            </CardContent>
        </Card>
    );
}
