"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  Zap,
  Globe,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import BookingCalendar from "@/components/booking/BookingCalendar";
import VehicleHeroGallery from "@/components/inventory/VehicleHeroGallery";
import VehicleGallerySection from "@/components/inventory/VehicleGallerySection";
import MarketPriceCard from "@/components/inventory/MarketPriceCard";
import { FuelType, Transmission, VehicleStatus } from "@prisma/client";

const fuelTypeLabels: Record<FuelType, string> = {
  PETROL: "Essence",
  DIESEL: "Diesel",
  ELECTRIC: "Électrique",
  HYBRID: "Hybride",
  PLUGIN_HYBRID: "Hybride rechargeable",
};

const transmissionLabels: Record<Transmission, string> = {
  MANUAL: "Manuelle",
  AUTOMATIC: "Automatique",
  CVT: "CVT",
};

const statusLabels: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  SOLD: "Vendu",
};

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [inquirySending, setInquirySending] = useState(false);
  const [appointmentSending, setAppointmentSending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [inquiryForm, setInquiryForm] = useState({
    firstName: "",
    lastName: "",
    email: session?.user?.email ?? "",
    phone: "",
    message: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    firstName: (session?.user as any)?.firstName ?? "",
    lastName: (session?.user as any)?.lastName ?? "",
    email: session?.user?.email ?? "",
    phone: (session?.user as any)?.phone ?? "",
    date: "",
    message: "",
  });
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setAppointmentForm((prev) => ({
        ...prev,
        firstName: prev.firstName || u.firstName || "",
        lastName: prev.lastName || u.lastName || "",
        email: prev.email || u.email || "",
        phone: prev.phone || u.phone || "",
      }));
    }
  }, [session?.user]);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await fetch(`/api/inventory/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          setVehicle(data);
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) fetchVehicle();
  }, [params.slug]);

  // Slots are loaded inside BookingCalendar when a day is selected.

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-[#F5F5F5] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9AA4B2]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-4">Véhicule non trouvé</h1>
          <Button onClick={() => router.push("/inventory")} variant="primary">
            Retour à l&apos;inventaire
          </Button>
        </div>
      </div>
    );
  }

  const coverImage = vehicle.coverImage || vehicle.images?.[0] || "/placeholder-vehicle.jpg";
  const galleryImages =
    vehicle.images?.length
      ? vehicle.images
      : vehicle.coverImage
        ? [vehicle.coverImage]
        : [];
  const price = vehicle.priceResale || vehicle.pricePurchase;
  const isAdmin = session?.user?.role === "ADMIN";
  const isAvailable = vehicle.status === "AVAILABLE";

  const specs = [
    { icon: Calendar, label: "Année", value: vehicle.year },
    { icon: Gauge, label: "Kilométrage", value: `${vehicle.mileage.toLocaleString()} km` },
    { icon: Fuel, label: "Carburant", value: fuelTypeLabels[vehicle.fuelType as FuelType] },
    { icon: Settings, label: "Boîte de vitesse", value: transmissionLabels[vehicle.transmission as Transmission] },
    ...(vehicle.color ? [{ icon: Palette, label: "Couleur", value: vehicle.color }] : []),
    { icon: Zap, label: "CV Fiscaux", value: vehicle.cvFiscaux },
    ...(vehicle.powerHp ? [{ icon: Zap, label: "Puissance", value: `${vehicle.powerHp} ch` }] : []),
    { icon: Globe, label: "Origine", value: vehicle.countryOrigin || "Allemagne" },
  ];

  const vehicleIdOrSlug = vehicle?.id ?? params.slug;

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!inquiryForm.firstName.trim() || !inquiryForm.lastName.trim() || !inquiryForm.email.trim() || !inquiryForm.phone.trim() || !inquiryForm.message.trim()) {
      setFormError("Veuillez remplir tous les champs.");
      return;
    }
    setInquirySending(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicleIdOrSlug}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });
      const data = await res.json();
      if (res.ok) {
        setInquirySuccess(true);
        setInquiryForm({ firstName: "", lastName: "", email: session?.user?.email ?? "", phone: "", message: "" });
      } else {
        setFormError(data.error || "Erreur lors de l'envoi.");
      }
    } catch {
      setFormError("Erreur de connexion.");
    } finally {
      setInquirySending(false);
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!appointmentForm.firstName.trim() || !appointmentForm.lastName.trim() || !appointmentForm.email.trim() || !appointmentForm.phone.trim() || !appointmentForm.date || !selectedSlot) {
      setFormError("Veuillez choisir une date, un créneau et remplir vos coordonnées.");
      return;
    }
    setAppointmentSending(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          date: appointmentForm.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          firstName: appointmentForm.firstName.trim(),
          lastName: appointmentForm.lastName.trim(),
          email: appointmentForm.email.trim(),
          phone: appointmentForm.phone.trim(),
          message: appointmentForm.message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppointmentSuccess(true);
        setAppointmentForm({
          firstName: "",
          lastName: "",
          email: session?.user?.email ?? "",
          phone: "",
          date: "",
          message: "",
        });
        setSelectedSlot(null);
      } else {
        setFormError(data.error || "Erreur lors de la prise de rendez-vous.");
      }
    } catch {
      setFormError("Erreur de connexion.");
    } finally {
      setAppointmentSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <VehicleHeroGallery
        heroRef={heroRef}
        images={[coverImage]}
        title={vehicle.title}
      >
        <div className="absolute inset-0 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-10"
          >
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 text-[#9AA4B2] hover:text-[#F5F5F5] transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;inventaire
            </Link>
          </motion.div>

          <div className="flex-1 flex flex-col justify-end p-6 md:p-10 pb-8">
            <div className="container-custom flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex w-fit px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-[#F5F5F5] backdrop-blur-sm border border-white/10">
                    {statusLabels[vehicle.status as VehicleStatus]}
                  </span>
                  {vehicle.potentialMargin > 0 && isAdmin && (
                    <span className="inline-flex w-fit px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      +{vehicle.potentialMargin.toLocaleString()} € marge potentielle
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F5F5F5] tracking-tight">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <p className="text-lg md:text-xl text-[#9AA4B2]">{vehicle.title}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="rounded-2xl border border-white/10 bg-[#111318]/90 backdrop-blur-md shadow-2xl p-6 w-full lg:w-auto lg:min-w-[280px]"
              >
                <div className="text-xs uppercase tracking-wider text-[#9AA4B2] mb-1">
                  Prix de vente
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[#F5F5F5]">
                  {price.toLocaleString()} €
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </VehicleHeroGallery>

      {/* Rectangular gallery (Leboncoin / LaCentrale style) */}
      {galleryImages.length > 0 && (
        <section className="container-custom py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <VehicleGallerySection images={galleryImages} title={vehicle.title} />
          </motion.div>
        </section>
      )}

      {/* Main — 2 columns */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Price + CTA mobile */}
              <div className="lg:hidden rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8 shadow-lg">
                <div className="mb-6 pb-6 border-b border-white/5">
                  <div className="text-sm text-[#9AA4B2] mb-1">Prix de vente</div>
                  <div className="text-4xl font-bold text-[#F5F5F5]">
                    {price.toLocaleString()} €
                  </div>
                </div>
                {isAvailable ? (
                  <div className="space-y-3">
                    <Button variant="primary" fullWidth size="lg" onClick={() => { setShowAppointmentModal(true); setFormError(null); setAppointmentSuccess(false); }}>
                      <Calendar className="w-5 h-5 mr-2" />
                      Prendre rendez-vous
                    </Button>
                    <Button variant="primary" fullWidth size="lg" onClick={() => { setShowInquiryModal(true); setFormError(null); setInquirySuccess(false); }}>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Demander des informations
                    </Button>
                  </div>
                ) : (
                  <p className="text-[#9AA4B2] text-center py-4">
                    Ce véhicule n&apos;est plus disponible
                  </p>
                )}
              </div>

              {/* Market price estimation */}
              <MarketPriceCard vehicleId={vehicle.id} vehiclePrice={price} />

              {/* Features grid */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-bold text-[#F5F5F5] mb-8">Caractéristiques</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {specs.map((spec, index) => {
                    const Icon = spec.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-xl bg-[#151922]/60 border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <div className="w-11 h-11 rounded-xl bg-[#111318] border border-white/5 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#9AA4B2]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#9AA4B2] mb-0.5">{spec.label}</div>
                          <div className="text-lg font-semibold text-[#F5F5F5]">{spec.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Description */}
              {vehicle.description && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">Description</h2>
                  <p className="text-[#9AA4B2] leading-relaxed whitespace-pre-line">
                    {vehicle.description}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right column — sticky price + CTA */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="lg:sticky lg:top-24 rounded-2xl border border-white/5 bg-[#111318] backdrop-blur-sm p-8 shadow-xl space-y-6 hover:shadow-2xl transition-shadow"
              >
                <div className="pb-6 border-b border-white/5">
                  <div className="text-sm text-[#9AA4B2] mb-2">Prix de vente</div>
                  <div className="text-4xl font-bold text-[#F5F5F5]">
                    {price.toLocaleString()} €
                  </div>
                </div>

                {isAvailable ? (
                  <div className="space-y-3">
                    <Button variant="primary" fullWidth size="lg" className="text-lg py-4" onClick={() => { setShowAppointmentModal(true); setFormError(null); setAppointmentSuccess(false); }}>
                      <Calendar className="w-5 h-5 mr-2" />
                      Prendre rendez-vous
                    </Button>
                    <Button variant="primary" fullWidth size="lg" className="text-lg py-4" onClick={() => { setShowInquiryModal(true); setFormError(null); setInquirySuccess(false); }}>
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Demander des informations
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
                    <p className="text-[#9AA4B2] font-medium">
                      Ce véhicule n&apos;est plus disponible
                    </p>
                  </div>
                )}

                {isAvailable && (
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-[#9AA4B2] text-center">
                      Financement disponible sur demande
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Demande d'information */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowInquiryModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-[#111318] w-full max-w-md shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Demander des informations</h3>
            {inquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-4">Votre demande a bien été envoyée. Nous vous recontacterons rapidement.</p>
                <Button variant="primary" onClick={() => setShowInquiryModal(false)}>Fermer</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Prénom *</label>
                    <input type="text" required value={inquiryForm.firstName} onChange={(e) => setInquiryForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Nom *</label>
                    <input type="text" required value={inquiryForm.lastName} onChange={(e) => setInquiryForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Email *</label>
                  <input type="email" required value={inquiryForm.email} onChange={(e) => setInquiryForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="vous@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Téléphone *</label>
                  <input type="tel" required value={inquiryForm.phone} onChange={(e) => setInquiryForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="06 12 34 56 78" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Message *</label>
                  <textarea required rows={4} value={inquiryForm.message} onChange={(e) => setInquiryForm((f) => ({ ...f, message: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40 resize-none" placeholder="Votre question sur ce véhicule..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="primary" fullWidth disabled={inquirySending}>{inquirySending ? "Envoi..." : "Envoyer"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowInquiryModal(false)}>Annuler</Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Modal Prise de rendez-vous */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowAppointmentModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-[#111318] w-full max-w-md shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Prendre rendez-vous</h3>
            {appointmentSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white mb-4">Votre demande de rendez-vous a bien été enregistrée. Nous vous confirmerons par email ou téléphone.</p>
                <Button variant="primary" onClick={() => setShowAppointmentModal(false)}>Fermer</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Choisir une date et un créneau *</label>
                  <BookingCalendar
                    selectedDate={appointmentForm.date}
                    onSelectDate={(date) => setAppointmentForm((f) => ({ ...f, date }))}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Prénom *</label>
                    <input type="text" required value={appointmentForm.firstName} onChange={(e) => setAppointmentForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="Jean" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Nom *</label>
                    <input type="text" required value={appointmentForm.lastName} onChange={(e) => setAppointmentForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="Dupont" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Email *</label>
                  <input type="email" required value={appointmentForm.email} onChange={(e) => setAppointmentForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="vous@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Téléphone *</label>
                  <input type="tel" required value={appointmentForm.phone} onChange={(e) => setAppointmentForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40" placeholder="06 12 34 56 78" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Message (optionnel)</label>
                  <textarea rows={2} value={appointmentForm.message} onChange={(e) => setAppointmentForm((f) => ({ ...f, message: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg bg-[#151922] border border-white/10 text-white placeholder:text-white/40 resize-none" placeholder="Précisions..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="primary" fullWidth disabled={appointmentSending || !selectedSlot}>{appointmentSending ? "Envoi..." : "Confirmer le rendez-vous"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAppointmentModal(false)}>Annuler</Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
