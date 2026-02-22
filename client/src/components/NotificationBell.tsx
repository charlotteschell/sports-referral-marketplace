import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 30000, // poll every 30s
  });
  const { data: notifications, refetch } = trpc.notification.list.useQuery(
    { limit: 20 },
    { enabled: open }
  );

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => {
      refetch();
      utils.notification.unreadCount.invalidate();
    },
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      refetch();
      utils.notification.unreadCount.invalidate();
    },
  });

  const utils = trpc.useUtils();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const count = unreadCount ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
      >
        <Bell className="w-5 h-5 text-stone-300" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] px-1">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-stone-500 text-sm">
                No notifications yet. Save some businesses and we'll keep you posted.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.notification.id}
                  className={`px-4 py-3 border-b border-stone-800 hover:bg-stone-800/50 transition-colors ${
                    !n.notification.isRead ? "bg-stone-800/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Business logo or icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {n.business?.logoUrl ? (
                        <img
                          src={n.business.logoUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <Bell className="w-4 h-4 text-amber-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.notification.isRead ? "text-white font-medium" : "text-stone-400"}`}>
                        {n.notification.title}
                      </p>
                      {n.notification.message && (
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                          {n.notification.message}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-stone-600">
                          {formatTimeAgo(new Date(n.notification.createdAt))}
                        </span>
                        {n.business?.slug && (
                          <Link
                            href={`/business/${n.business.slug}`}
                            onClick={() => {
                              if (!n.notification.isRead) {
                                markRead.mutate({ notificationId: n.notification.id });
                              }
                              setOpen(false);
                            }}
                            className="text-[10px] text-amber-500 hover:text-amber-400 flex items-center gap-0.5"
                          >
                            View <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                        {!n.notification.isRead && (
                          <button
                            onClick={() => markRead.mutate({ notificationId: n.notification.id })}
                            className="text-[10px] text-stone-600 hover:text-stone-400 flex items-center gap-0.5"
                          >
                            <Check className="w-2.5 h-2.5" /> Read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.notification.isRead && (
                      <div className="flex-shrink-0 mt-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-stone-700 text-center">
              <Link
                href="/athlete-dashboard"
                onClick={() => setOpen(false)}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                View all in dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
