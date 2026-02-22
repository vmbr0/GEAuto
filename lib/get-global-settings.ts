import { prisma } from "@/lib/prisma";

const DEFAULT_KEY = "default";

export const DEFAULT_GLOBAL_SETTINGS = {
  regionPricePerCV: 46.15,
  defaultTransportCost: 800,
  germanTempPlateCost: 150,
} as const;

export type GlobalSettingsResult = {
  regionPricePerCV: number;
  defaultTransportCost: number;
  germanTempPlateCost: number;
};

/**
 * Vérifie si l'erreur Prisma indique que la table n'existe pas (ex: après un redémarrage sans db push).
 */
export function isTableMissingError(error: unknown): boolean {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message?: string }).message);
    return msg.includes("does not exist");
  }
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code?: string }).code === "P2021";
  }
  return false;
}

/**
 * Récupère les paramètres globaux. Si la table `global_settings` n'existe pas
 * (ex: DB réinitialisée, premier démarrage), retourne les valeurs par défaut
 * pour éviter de faire planter l'app. Penser à lancer `npx prisma db push` pour créer les tables.
 */
export async function getGlobalSettingsWithFallback(): Promise<GlobalSettingsResult> {
  try {
    let settings = await prisma.globalSettings.findUnique({
      where: { key: DEFAULT_KEY },
    });

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          key: DEFAULT_KEY,
          ...DEFAULT_GLOBAL_SETTINGS,
        },
      });
    }

    return {
      regionPricePerCV: settings.regionPricePerCV,
      defaultTransportCost: settings.defaultTransportCost,
      germanTempPlateCost: settings.germanTempPlateCost,
    };
  } catch (error) {
    if (isTableMissingError(error)) {
      console.warn(
        "[getGlobalSettings] Table global_settings absente. Utilisation des valeurs par défaut. Pour créer les tables : npx prisma db push"
      );
      return { ...DEFAULT_GLOBAL_SETTINGS };
    }
    throw error;
  }
}

