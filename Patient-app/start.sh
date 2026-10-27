#!/bin/bash
# ============================================================
#  Cabinet Médical — Script de démarrage rapide
# ============================================================

echo ""
echo "🏥  Cabinet Médical — Démarrage"
echo "================================"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/get-docker/"
  exit 1
fi

echo "✅  Docker détecté"
echo ""

# Build & start
echo "🔨  Construction et démarrage des conteneurs..."
docker compose up --build -d

echo ""
echo "⏳  Attente du démarrage de MongoDB..."
sleep 8

# Seed database
echo "🌱  Import des données de démo (XML → MongoDB)..."
docker exec cabinet_backend node scripts/seed.js

echo ""
echo "============================================="
echo "✅  Application démarrée avec succès !"
echo ""
echo "  🌐  Frontend  →  http://localhost:3000"
echo "  🔌  API REST  →  http://localhost:5000/api"
echo "  🗄️   MongoDB   →  mongodb://localhost:27017"
echo ""
echo "  👨‍⚕️  Médecin  : dr.martin@cabinet.fr / medecin123"
echo "  🧑  Patient  : sophie.bernard@email.fr / patient123"
echo "============================================="
echo ""
