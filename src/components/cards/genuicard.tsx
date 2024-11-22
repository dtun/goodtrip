import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function GenUICard() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>GoodTrip</CardTitle>
          <CardDescription>Your Family Adventure, AI Perfected</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground/90 leading-normal prose">
          <p className="mb-3">
            {`Planning a family vacation shouldn't feel like work. GoodTrip uses
            AI to craft personalized USA travel itineraries that balance
            everyone's needs - from kid-friendly activities to parent-approved
            schedules. Just tell us your preferences, and we'll create a
            detailed day-by-day plan with restaurants, attractions, and built-in
            downtime. No more endless research or stressful planning - just
            quality family time.`}
          </p>
          <p>
            <Link href="/" className="underline">
              {`Let's do this thing.`}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
