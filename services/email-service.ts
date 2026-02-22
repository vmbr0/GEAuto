/**
 * High-level email sending. Call from API routes after main logic.
 * Does not block; failures are logged only.
 */

import { sendEmail } from "@/lib/email/send";
import { emailTemplates } from "@/lib/email/templates";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

const BASE_URL =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const emailService = {
  sendAppointmentConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    sendEmail({
      to: data.to,
      subject: "Confirmation de votre rendez-vous — GE Auto Import",
      html: emailTemplates.appointmentConfirmation({
        ...data,
        date: format(new Date(data.date), "EEEE d MMMM yyyy", { locale: fr }),
      }),
    });
  },

  sendAppointmentStatusUpdate(data: {
    to: string;
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }) {
    sendEmail({
      to: data.to,
      subject: "Mise à jour de votre rendez-vous — GE Auto Import",
      html: emailTemplates.appointmentStatusUpdate({
        ...data,
        date: format(new Date(data.date), "EEEE d MMMM yyyy", { locale: fr }),
      }),
    });
  },

  sendInquiryConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    messagePreview?: string;
  }) {
    sendEmail({
      to: data.to,
      subject: "Demande d'information reçue — GE Auto Import",
      html: emailTemplates.inquiryConfirmation(data),
    });
  },

  sendAdminReplyToInquiry(data: {
    to: string;
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    adminMessage: string;
  }) {
    sendEmail({
      to: data.to,
      subject: "Réponse à votre demande — GE Auto Import",
      html: emailTemplates.adminReplyToInquiry(data),
    });
  },

  sendVehicleRequestConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    brand: string;
    model: string;
    notes?: string;
  }) {
    sendEmail({
      to: data.to,
      subject: "Demande d'import enregistrée — GE Auto Import",
      html: emailTemplates.vehicleRequestConfirmation(data),
    });
  },

  sendPartsRequestConfirmation(data: {
    to: string;
    firstName: string;
    lastName: string;
    partName: string;
    vehicleModel?: string;
    notes?: string;
  }) {
    sendEmail({
      to: data.to,
      subject: "Demande de pièce enregistrée — GE Auto Import",
      html: emailTemplates.partsRequestConfirmation(data),
    });
  },

  sendPasswordReset(data: { to: string; firstName?: string; token: string }) {
    const resetLink = `${BASE_URL}/reset-password?token=${encodeURIComponent(data.token)}`;
    sendEmail({
      to: data.to,
      subject: "Réinitialisation de mot de passe — GE Auto Import",
      html: emailTemplates.passwordReset({
        firstName: data.firstName,
        resetLink,
        expiresMinutes: 30,
      }),
    });
  },
};
