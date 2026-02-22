import { prisma } from "@/lib/prisma";
import { getGlobalSettingsWithFallback, isTableMissingError } from "@/lib/get-global-settings";
import { ImportCostCalculation } from "@/types/inventory";

const DEFAULT_COC_PRICE = 200;

/**
 * Service de calcul des coûts d'importation
 * Utilise GlobalSettings (singleton) et CocPrice par marque.
 */
export class ImportCostCalculator {
  /**
   * Récupère les paramètres globaux (une seule ligne active).
   * Utilise des valeurs par défaut si la table global_settings n'existe pas encore.
   */
  private async getGlobalSettings() {
    return getGlobalSettingsWithFallback();
  }

  /**
   * Récupère le prix COC pour une marque (fallback si marque non trouvée ou table absente).
   */
  private async getCocPrice(brand: string): Promise<number> {
    if (!brand?.trim()) return DEFAULT_COC_PRICE;

    try {
      const cocPrice = await prisma.cocPrice.findUnique({
        where: { brand: brand.toUpperCase() },
      });
      return cocPrice?.price ?? DEFAULT_COC_PRICE;
    } catch (error) {
      if (isTableMissingError(error)) {
        return DEFAULT_COC_PRICE;
      }
      throw error;
    }
  }

  /**
   * Calcule le coût total d'importation
   */
  async calculateImportCost(params: {
    purchasePrice: number;
    cvFiscaux: number;
    brand: string;
  }): Promise<ImportCostCalculation> {
    const settings = await this.getGlobalSettings();
    const cocPrice = await this.getCocPrice(params.brand);

    const carteGrise = params.cvFiscaux * settings.regionPricePerCV;

    const total =
      params.purchasePrice +
      carteGrise +
      cocPrice +
      settings.germanTempPlateCost +
      settings.defaultTransportCost;

    return {
      purchasePrice: params.purchasePrice,
      carteGrise,
      cocPrice,
      germanTempPlateCost: settings.germanTempPlateCost,
      transportCost: settings.defaultTransportCost,
      total,
    };
  }

  /**
   * Calcule la marge potentielle
   */
  async calculatePotentialMargin(params: {
    purchasePrice: number;
    cvFiscaux: number;
    brand: string;
    avgFrancePrice?: number;
  }): Promise<number | null> {
    if (!params.avgFrancePrice) {
      return null;
    }

    const importCost = await this.calculateImportCost({
      purchasePrice: params.purchasePrice,
      cvFiscaux: params.cvFiscaux,
      brand: params.brand,
    });

    return params.avgFrancePrice - importCost.total;
  }
}

export const importCostCalculator = new ImportCostCalculator();
