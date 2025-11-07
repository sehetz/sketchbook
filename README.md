# Sketchbook

## 0. Lokale Entwicklung

### Voraussetzungen
- Node.js (>= v22)
- npm (>= v10)
- Docker Desktop (für NocoDB)
- Git

### Setup

Repository klonen:
```bash
git clone https://github.com/sehetz/sketchbook.github.io.git
cd sketchbook.github.io
```

Entwicklungsumgebung starten:
```bash
npm install
npm run dev
```
Die Website ist dann unter http://localhost:5173 erreichbar.

### NocoDB starten
```bash
cd ~/nocodb
docker-compose up -d
```
NocoDB-Interface unter http://localhost:8080 öffnen und sicherstellen, dass die Tabellen verfügbar sind.

---

## 1. Datenstruktur und Anbindungen

### Übersicht
Sketchbook nutzt NocoDB als Headless-Datenbank.
Die React-App kommuniziert über die REST-API direkt mit der NocoDB-Instanz.

### Tabellen

| Tabelle | Zweck | Verknüpfungen |
|----------|--------|---------------|
| Projects | Haupttabelle, enthält alle Projekte (Name, Beschreibung, Jahr, Bild etc.) | linked to Skills, Gear, Teams |
| Skills | Fähigkeiten oder Technologien | linked to Projects |
| Gear | Tools oder Ausrüstung | linked to Projects |
| Teams | Personen, Partner oder Mitwirkende | linked to Projects |

### API-Endpunkte (Beispiele)

Basis-URL:
```
http://localhost:8080/api/v1/Sketchbook
```

Beispiele:
```
GET /Projects
GET /Skills
GET /Gear
GET /Teams
```

Jede Anfrage erfordert einen gültigen NocoDB API-Token im Header:
```
xc-token: <DEIN_API_KEY>
```

Beispiel:
```bash
curl -H "xc-token: <DEIN_API_KEY>" http://localhost:8080/api/v1/Sketchbook/Projects
```

---

## 2. Verwendete Technologien

### Frontend
- React 18
- Vite (Build-Tool und Dev-Server)
- JavaScript (ESNext)
- Fetch API für HTTP-Requests

### Backend
- NocoDB (self-hosted via Docker)
- SQLite (lokale Datenbank für Entwicklung)
- REST API

### Infrastruktur
- GitHub (Versionierung)
- GitHub Pages (Deployment)
- Docker Desktop (lokale Containerumgebung)

---

## 3. Version Log

| Version | Datum | Beschreibung |
|----------|--------|---------------|
| 0.1.0 | 2025-11-07 | Initiales React-Projekt mit Vite erstellt, Verbindung zu NocoDB vorbereitet |
| 0.0.1 | 2025-11-06 | NocoDB eingerichtet, Tabellen erstellt (Projects, Skills, Gear, Teams) |
