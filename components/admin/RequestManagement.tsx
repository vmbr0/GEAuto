"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { RequestStatus } from "@prisma/client";
import { MessageSquare } from "lucide-react";

interface RequestManagementProps {
  request: any;
  requestType: string;
}

const statusOptions = [
  { value: RequestStatus.PENDING, label: "En attente" },
  { value: RequestStatus.SEARCHING, label: "Recherche en cours" },
  { value: RequestStatus.FOUND, label: "Trouvé" },
  { value: RequestStatus.QUOTED, label: "Devis envoyé" },
  { value: RequestStatus.COMPLETED, label: "Terminé" },
  { value: RequestStatus.CANCELLED, label: "Annulé" },
];

export default function RequestManagement({ request, requestType }: RequestManagementProps) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleStatusUpdate = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/requests/${requestType}/${request.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la mise à jour");
        setIsLoading(false);
        return;
      }

      setSuccess("Statut mis à jour avec succès");
      router.refresh();
      setIsLoading(false);
    } catch (err) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/requests/${requestType}/${request.id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'envoi");
        setIsLoading(false);
        return;
      }

      setSuccess("Message envoyé avec succès");
      setMessage("");
      router.refresh();
      setIsLoading(false);
    } catch (err) {
      setError("Une erreur est survenue");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="dark">
        <h3 className="text-xl font-bold mb-4 text-[#F5F5F5]">Mettre à jour le statut</h3>
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
            {success}
          </div>
        )}
        <div className="flex gap-4">
          <div className="flex-1">
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as RequestStatus)}
              className="bg-[#151922] border-[rgba(255,255,255,0.06)] text-[#F5F5F5] [&>option]:bg-[#111318]"
            />
          </div>
          <Button
            onClick={handleStatusUpdate}
            isLoading={isLoading}
            disabled={status === request.status}
          >
            Mettre à jour
          </Button>
        </div>
      </Card>

      <Card variant="dark">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#F5F5F5]">
          <MessageSquare className="w-5 h-5 text-[#9AA4B2]" />
          Messages ({(requestType === "vehicle" ? request.vehicleMessages : request.partsMessages)?.length || 0})
        </h3>
        {(requestType === "vehicle" ? request.vehicleMessages : request.partsMessages) && (requestType === "vehicle" ? request.vehicleMessages : request.partsMessages).length > 0 && (
          <div className="space-y-4 mb-6">
            {(requestType === "vehicle" ? request.vehicleMessages : request.partsMessages).map((msg: any) => (
              <div
                key={msg.id}
                className="p-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-[#F5F5F5]">
                      {msg.sender.name || msg.sender.email}
                      {msg.sender.role === "ADMIN" && (
                        <span className="ml-2 text-xs bg-[rgba(255,255,255,0.08)] text-[#9AA4B2] px-2 py-1 rounded border border-[rgba(255,255,255,0.06)]">
                          Admin
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(msg.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
                <p className="text-[#F5F5F5] whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="space-y-4">
          <Textarea
            label="Envoyer un message au client"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Tapez votre message..."
            required
            className="bg-[#151922] border-[rgba(255,255,255,0.06)] text-[#F5F5F5] placeholder:text-[#6B7280]"
          />
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!message.trim()}>
            Envoyer
          </Button>
        </form>
      </Card>
    </div>
  );
}
