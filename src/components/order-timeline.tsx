import { formatDateTime } from "@/lib/utils";
import { Card } from "./ui";

type TimelineEvent = {
  eventType: string;
  message: string;
  createdAt: string;
};

export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Timeline</h3>
      <div className="mt-5 space-y-4">
        {events.length ? (
          events.map((event) => (
            <div key={`${event.eventType}-${event.createdAt}`} className="grid grid-cols-[0.85rem_1fr] gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-[color:var(--accent)]" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{event.eventType}</p>
                  <span className="text-xs text-slate-500">{formatDateTime(event.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{event.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[color:var(--muted)]">No events yet.</p>
        )}
      </div>
    </Card>
  );
}

