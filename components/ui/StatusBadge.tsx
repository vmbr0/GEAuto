"use client";

import { RequestStatus } from "@prisma/client";
import Badge from "./Badge";

interface StatusBadgeProps {
  status: RequestStatus;
  dark?: boolean;
}

const statusConfig: Record<RequestStatus, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
  PENDING: { label: "En attente", variant: "default" },
  SEARCHING: { label: "Recherche en cours", variant: "info" },
  FOUND: { label: "Trouvé", variant: "success" },
  QUOTED: { label: "Devis envoyé", variant: "warning" },
  COMPLETED: { label: "Terminé", variant: "success" },
  CANCELLED: { label: "Annulé", variant: "error" },
};

export default function StatusBadge({ status, dark }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} dark={dark}>
      {config.label}
    </Badge>
  );
}
