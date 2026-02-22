/**
 * HTML email templates. Branded, clean layout.
 * Escape user content to prevent XSS.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const baseStyles = `
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: #1a1a1a;
  max-width: 560px;
  margin: 0 auto;
`;
const cardStyle = `
  background: #111318;
  border-radius: 12px;
  padding: 24px;
  color: #e5e5e5;
`;
const titleStyle = `font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #f5f5f5;`;
const textStyle = `margin-bottom: 12px; color: #9aa4b2;`;
const labelStyle = `color: #6b7280; font-size: 12px;`;
const footerStyle = `margin-top: 24px; font-size: 12px; color: #6b7280;`;

function wrapBody(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${baseStyles}">
  <div style="${cardStyle}">
    <h1 style="${titleStyle}">${escapeHtml(title)}</h1>
    ${content}
    <p style="${footerStyle}">— GE Auto Import</p>
  </div>
</body>
</html>`;
}

export const emailTemplates = {
  appointmentConfirmation(data: {
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    contactEmail?: string;
  }) {
    const content = `
      <p style="${textStyle}">Bonjour ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)},</p>
      <p style="${textStyle}">Votre demande de rendez-vous pour l'essai du véhicule ci-dessous a bien été enregistrée.</p>
      <p style="${labelStyle}">VÉHICULE</p>
      <p style="${textStyle}">${escapeHtml(data.vehicleTitle)}</p>
      <p style="${labelStyle}">DATE ET CRÉNEAU</p>
      <p style="${textStyle}">${escapeHtml(data.date)} · ${escapeHtml(data.startTime)} – ${escapeHtml(data.endTime)}</p>
      <p style="${textStyle}">Nous vous confirmerons ce rendez-vous par email ou téléphone.</p>
      ${data.contactEmail ? `<p style="${textStyle}">Contact : ${escapeHtml(data.contactEmail)}</p>` : ""}
    `;
    return wrapBody(content, "Confirmation de rendez-vous");
  },

  appointmentStatusUpdate(data: {
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }) {
    const statusLabel = statusLabels[data.status] ?? data.status;
    const content = `
      <p style="${textStyle}">Bonjour ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)},</p>
      <p style="${textStyle}">Votre rendez-vous a été mis à jour.</p>
      <p style="${labelStyle}">VÉHICULE</p>
      <p style="${textStyle}">${escapeHtml(data.vehicleTitle)}</p>
      <p style="${labelStyle}">CRÉNEAU</p>
      <p style="${textStyle}">${escapeHtml(data.date)} · ${escapeHtml(data.startTime)} – ${escapeHtml(data.endTime)}</p>
      <p style="${labelStyle}">STATUT</p>
      <p style="${textStyle}"><strong>${escapeHtml(statusLabel)}</strong></p>
    `;
    return wrapBody(content, "Mise à jour de votre rendez-vous");
  },

  inquiryConfirmation(data: {
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    messagePreview?: string;
  }) {
    const content = `
      <p style="${textStyle}">Bonjour ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)},</p>
      <p style="${textStyle}">Votre demande d'information a bien été reçue.</p>
      <p style="${labelStyle}">VÉHICULE</p>
      <p style="${textStyle}">${escapeHtml(data.vehicleTitle)}</p>
      ${data.messagePreview ? `<p style="${labelStyle}">VOTRE MESSAGE</p><p style="${textStyle}">${escapeHtml(data.messagePreview)}</p>` : ""}
      <p style="${textStyle}">Nous vous recontacterons rapidement.</p>
    `;
    return wrapBody(content, "Demande d'information enregistrée");
  },

  adminReplyToInquiry(data: {
    firstName: string;
    lastName: string;
    vehicleTitle: string;
    adminMessage: string;
  }) {
    const content = `
      <p style="${textStyle}">Bonjour ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)},</p>
      <p style="${textStyle}">Nous vous répondons concernant votre demande d'information sur le véhicule : <strong>${escapeHtml(data.vehicleTitle)}</strong>.</p>
      <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="${textStyle}; white-space: pre-wrap;">${escapeHtml(data.adminMessage)}</p>
      </div>
      <p style="${textStyle}">N'hésitez pas à nous recontacter pour toute question.</p>
    `;
    return wrapBody(content, "Réponse à votre demande");
  },

  vehicleRequestConfirmation(data: {
    firstName: string;
    lastName: string;
    brand: string;
    model: string;
    notes?: string;
  }) {
    const content = `
      <p style="${textStyle}">Bonjour ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)},</p>
      <p style="${textStyle}">Votre demande d'import véhicule a bien été enregistrée.</p>
      <p style="${labelStyle}">RECHERCHE</p>
      <p style="${textStyle}">${escapeHtml(data.brand)} ${escapeHtml(data.model)}</p>
      ${data.notes ? `<p style="${labelStyle}">NOTES</p><p style="${textStyle}">${escapeHtml(data.notes)}</p>` : ""}
      <p style="${textStyle}">Nous vous tiendrons informé de l'avancement.</p>
    `;
    return wrapBody(content, "Confirmation de votre demande d'import");
  },

  partsRequestConfirmation(data: {
    firstName: string;
    lastName: string;
    partName: string;
    vehicleModel?: string;
    notes?: string;
  }) {
    const content = `
      <p style="${textStyle}">Bonjour ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)},</p>
      <p style="${textStyle}">Votre demande de pièce a bien été enregistrée.</p>
      <p style="${labelStyle}">PIÈCE</p>
      <p style="${textStyle}">${escapeHtml(data.partName)}</p>
      ${data.vehicleModel ? `<p style="${labelStyle}">VÉHICULE</p><p style="${textStyle}">${escapeHtml(data.vehicleModel)}</p>` : ""}
      ${data.notes ? `<p style="${labelStyle}">NOTES</p><p style="${textStyle}">${escapeHtml(data.notes)}</p>` : ""}
      <p style="${textStyle}">Nous vous recontacterons dès que nous avons des informations.</p>
    `;
    return wrapBody(content, "Confirmation de votre demande de pièce");
  },

  passwordReset(data: { firstName?: string; resetLink: string; expiresMinutes: number }) {
    const name = data.firstName ? ` ${escapeHtml(data.firstName)}` : "";
    const content = `
      <p style="${textStyle}">Bonjour${name},</p>
      <p style="${textStyle}">Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien ci-dessous pour en choisir un nouveau (valable ${data.expiresMinutes} minutes) :</p>
      <p style="${textStyle}"><a href="${escapeHtml(data.resetLink)}" style="color: #34d399;">Réinitialiser mon mot de passe</a></p>
      <p style="${textStyle}">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p style="${footerStyle}">Ce lien est à usage unique et expirera automatiquement.</p>
    `;
    return wrapBody(content, "Réinitialisation de mot de passe");
  },
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};
