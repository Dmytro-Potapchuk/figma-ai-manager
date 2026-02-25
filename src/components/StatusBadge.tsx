import { cn } from "@/lib/utils";

type StatusType = "online" | "offline" | "error" | "training";

const statusLabels: Record<StatusType, string> = {
  online: "Aktywny",
  offline: "Wyłączony",
  error: "Błąd",
  training: "Trenowanie",
};

export function StatusBadge({ status }: { status: StatusType }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          status === "online" && "status-online",
          status === "offline" && "status-offline",
          status === "error" && "status-error",
          status === "training" && "status-training"
        )}
      />
      <span className="text-sm text-muted-foreground">{statusLabels[status]}</span>
    </div>
  );
}
