import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

export default function Notes() {
    return (
        <Card className="w-full h-full shadow-lg flex flex-col bg-card">
            <CardHeader className="shrink-0">
                <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-y-auto">
                <Textarea
                    placeholder="Write your notes here..."
                    className="resize-none flex-grow h-full"
                />
            </CardContent>
        </Card>
    );
}
