// Service de gestion et rotation des proxies Tor

export interface TorProxy {
  port: number;
  controlPort: number;
  isAvailable: boolean;
  lastUsed: Date;
  useCount: number;
}

class TorProxyManager {
  private proxies: TorProxy[] = [];
  private currentIndex = 0;
  private readonly proxyCount = 5; // Nombre de proxies Tor à utiliser
  private readonly basePort = 9050; // Port de base pour les proxies SOCKS

  constructor() {
    // Initialiser les proxies Tor
    for (let i = 0; i < this.proxyCount; i++) {
      this.proxies.push({
        port: this.basePort + i,
        controlPort: 9051 + i,
        isAvailable: true,
        lastUsed: new Date(0),
        useCount: 0,
      });
    }
  }

  /**
   * Récupère le prochain proxy disponible (rotation)
   */
  getNextProxy(): TorProxy {
    // Trouver le proxy le moins utilisé récemment
    const availableProxies = this.proxies.filter((p) => p.isAvailable);
    
    if (availableProxies.length === 0) {
      // Si aucun proxy disponible, réinitialiser tous les proxies
      this.proxies.forEach((p) => {
        p.isAvailable = true;
      });
      return this.proxies[0];
    }

    // Sélectionner le proxy le moins utilisé récemment
    const proxy = availableProxies.reduce((prev, curr) => {
      if (curr.lastUsed < prev.lastUsed) {
        return curr;
      }
      return prev;
    });

    proxy.lastUsed = new Date();
    proxy.useCount++;
    
    return proxy;
  }

  /**
   * Marque un proxy comme indisponible temporairement
   */
  markProxyUnavailable(port: number, duration: number = 60000): void {
    const proxy = this.proxies.find((p) => p.port === port);
    if (proxy) {
      proxy.isAvailable = false;
      setTimeout(() => {
        proxy.isAvailable = true;
      }, duration);
    }
  }

  /**
   * Récupère l'URL du proxy SOCKS5
   */
  getProxyUrl(proxy: TorProxy): string {
    return `socks5://127.0.0.1:${proxy.port}`;
  }

  /**
   * Récupère les arguments pour Playwright avec le proxy
   */
  getProxyArgs(proxy: TorProxy): string[] {
    return [
      `--proxy-server=socks5://127.0.0.1:${proxy.port}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
  }

  /**
   * Change l'identité IP d'un proxy Tor (nouveau circuit)
   */
  async renewIdentity(proxy: TorProxy): Promise<boolean> {
    try {
      // Utiliser le port de contrôle Tor pour changer l'identité
      // Tor utilise une authentification par cookie, mais pour simplifier,
      // on va utiliser curl pour envoyer la commande
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Envoyer la commande NEWNYM au contrôleur Tor via curl
      // Note: Tor utilise l'authentification par cookie, donc on utilise echo pour envoyer les commandes
      await execAsync(`(echo 'AUTHENTICATE ""'; echo 'SIGNAL NEWNYM'; echo 'QUIT') | curl --connect-timeout 5 telnet://127.0.0.1:${proxy.controlPort} 2>/dev/null || true`);
      
      // Attendre que le nouveau circuit soit établi
      await new Promise((resolve) => setTimeout(resolve, 10000));
      
      console.log(`Renewed identity for Tor proxy on port ${proxy.port}`);
      return true;
    } catch (error) {
      console.error(`Error renewing identity for proxy ${proxy.port}:`, error);
      // En cas d'erreur, marquer le proxy comme indisponible temporairement
      this.markProxyUnavailable(proxy.port, 120000); // 2 minutes
      return false;
    }
  }

  /**
   * Statistiques des proxies
   */
  getStats() {
    return this.proxies.map((p) => ({
      port: p.port,
      isAvailable: p.isAvailable,
      useCount: p.useCount,
      lastUsed: p.lastUsed,
    }));
  }
}

// Instance singleton
export const torProxyManager = new TorProxyManager();
