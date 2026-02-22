"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Calendar } from "lucide-react";
import VehicleForm from "@/components/admin/inventory/VehicleForm";
import Card from "@/components/ui/Card";

export default function EditVehiclePage() {
  const params = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/admin/inventory/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setVehicle(data);
        } else {
          router.push("/admin/inventory");
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        router.push("/admin/inventory");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchVehicle();
    }
  }, [params.id, router]);

  const handleSuccess = () => {
    router.push("/admin/inventory");
  };

  const handleCancel = () => {
    router.push("/admin/inventory");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  const countInquiries = vehicle._count?.inquiries ?? 0;
  const countAppointments = vehicle._count?.appointments ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Modifier le véhicule</h1>
        <p className="text-white/80">
          Modifiez les informations du véhicule
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/admin/inquiries"
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white/90 hover:bg-white/10 text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            {countInquiries} demande(s) d&apos;info
          </Link>
          <Link
            href="/admin/appointments"
            className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white/90 hover:bg-white/10 text-sm"
          >
            <Calendar className="w-4 h-4" />
            {countAppointments} rendez-vous
          </Link>
        </div>
      </div>

      <Card variant="dark">
        <div className="p-8">
          <VehicleForm
            vehicle={vehicle}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </Card>
    </div>
  );
}
