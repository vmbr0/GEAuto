"use client";

import { useRouter } from "next/navigation";
import VehicleForm from "@/components/admin/inventory/VehicleForm";

export default function CreateVehiclePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/admin/inventory");
  };

  const handleCancel = () => {
    router.push("/admin/inventory");
  };

  return (
    <div>
      <header className="mb-10">
        <p className="text-sm text-[#6B7280] mb-1">Admin</p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F5F5F5] mb-2">
          Ajouter un véhicule
        </h1>
        <p className="text-[#9AA4B2]">
          Créez un nouveau véhicule dans l&apos;inventaire
        </p>
      </header>

      <div className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8">
        <VehicleForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
