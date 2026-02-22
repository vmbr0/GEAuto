#!/bin/sh
# Script d'initialisation de plusieurs instances Tor

echo "Initializing Tor instances..."

# Créer les répertoires pour chaque instance
for i in 0 1 2 3 4; do
  mkdir -p /var/lib/tor$i
  chmod 700 /var/lib/tor$i 2>/dev/null || true
done

# Configuration Tor pour chaque instance (ports différents)
for i in 0 1 2 3 4; do
  SOCKS_PORT=$((9050 + $i))
  CONTROL_PORT=$((9051 + $i))
  
  cat > /tmp/torrc$i <<EOF
SocksPort $SOCKS_PORT
ControlPort $CONTROL_PORT
DataDirectory /var/lib/tor$i
RunAsDaemon 1
CookieAuthentication 1
ExitNodes {de},{fr},{nl},{be}
StrictNodes 0
MaxCircuitDirtiness 600
CircuitBuildTimeout 10
KeepalivePeriod 60
NewCircuitPeriod 30
NumEntryGuards 3
EOF

  # Démarrer l'instance Tor
  tor -f /tmp/torrc$i > /dev/null 2>&1 &
  echo "Started Tor instance $i on SOCKS port $SOCKS_PORT and Control port $CONTROL_PORT"
  sleep 2
done

# Attendre que tous les circuits Tor soient établis
echo "Waiting for Tor circuits to be established..."
sleep 25

# Vérifier que les proxies fonctionnent (simplifié)
for i in 0 1 2 3 4; do
  SOCKS_PORT=$((9050 + $i))
  echo "Checking Tor instance $i on port $SOCKS_PORT..."
  # Test simple de connexion
  (echo > /dev/tcp/127.0.0.1/$SOCKS_PORT) 2>/dev/null && echo "✓ Tor instance $i port is open" || echo "✗ Tor instance $i port is closed"
done

echo "Tor initialization complete"
