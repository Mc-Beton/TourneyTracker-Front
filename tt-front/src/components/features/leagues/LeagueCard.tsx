import { LeagueDTO } from "@/lib/types/league";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, UsersIcon, ShieldIcon } from "lucide-react";
import Link from "next/link";

interface LeagueCardProps {
  league: LeagueDTO;
}

export function LeagueCard({ league }: LeagueCardProps) {
  const isOwner = false; // logic checks can be added later

  // Status Logic
  const now = new Date();
  const start = new Date(league.startDate);
  const end = new Date(league.endDate);

  let statusText = "Active";
  let statusColor = "text-green-600 bg-green-100";

  if (now < start) {
    statusText = "Upcoming";
    statusColor = "text-blue-600 bg-blue-100";
  } else if (now > end) {
    statusText = "Finished";
    statusColor = "text-gray-600 bg-gray-100";
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>{league.name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {league.description || "No description"}
          </CardDescription>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {statusText}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <ShieldIcon className="w-4 h-4" />
            <span>System: {league.gameSystem?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Ends: {end.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            <span>Members: {league.memberCount || 0}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/leagues/${league.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
