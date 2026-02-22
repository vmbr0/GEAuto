/**
 * Utilitaires pour la gestion de l'inventaire
 */

/**
 * Génère un slug à partir d'un titre
 */
export function generateSlug(title: string, brand: string, model: string, year: number): string {
  const base = `${brand}-${model}-${year}-${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ""); // Supprimer les tirets en début et fin

  // Ajouter un timestamp pour garantir l'unicité
  const timestamp = Date.now().toString(36);
  return `${base}-${timestamp}`;
}

/**
 * Valide les données d'un véhicule
 */
export function validateVehicleData(data: {
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  cvFiscaux: number;
  pricePurchase: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Le titre est requis");
  }

  if (!data.brand || data.brand.trim().length === 0) {
    errors.push("La marque est requise");
  }

  if (!data.model || data.model.trim().length === 0) {
    errors.push("Le modèle est requis");
  }

  const currentYear = new Date().getFullYear();
  if (!data.year || data.year < 1900 || data.year > currentYear + 1) {
    errors.push(`L'année doit être entre 1900 et ${currentYear + 1}`);
  }

  if (data.mileage < 0) {
    errors.push("Le kilométrage ne peut pas être négatif");
  }

  if (data.cvFiscaux <= 0) {
    errors.push("Le nombre de CV fiscaux doit être supérieur à 0");
  }

  if (data.pricePurchase <= 0) {
    errors.push("Le prix d'achat doit être supérieur à 0");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
