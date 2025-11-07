# 🎨 Sketchbook Portfolio

Dieses Projekt ist mein persönliches Portfolio, das **NocoDB** als Datenbank-Backend nutzt und mit **GitHub Pages** gehostet wird.

---

## 🚀 Development Setup

### Voraussetzungen
- **Docker Desktop** installiert und gestartet
- **NocoDB** läuft lokal (siehe unten)

### NocoDB starten

```bash
cd ~/nocodb
docker-compose up -d
Dann im Browser öffnen:
👉 http://localhost:8080

Website lokal entwickeln
Falls du an der Website arbeitest (z. B. mit HTML/JS oder React):

bash
Code kopieren
git clone https://github.com/sehetz/sketchbook.github.io.git
cd sketchbook.github.io
npm install
npm run dev
Danach öffnet sich die Website meist unter:
👉 http://localhost:5173

🧱 Datenstruktur (NocoDB)
Tabelle	Beschreibung	Beziehung
Projects	Haupttabelle mit allen Projekten (Name, Beschreibung, Jahr, etc.)	🔗 Linked mit Skills, Gear, Teams
Skills	Fähigkeiten oder Technologien	🔗 Many-to-many mit Projects
Gear	Tools oder Ausrüstung	🔗 Many-to-many mit Projects
Teams	Personen oder Partner	🔗 Many-to-many mit Projects

🔑 API & Keys
Schlüssel	Beschreibung
NocoDB Base URL	http://localhost:8080/api/v1/Sketchbook
Projects API	/Projects
Skills API	/Skills
Gear API	/Gear
Teams API	/Teams
Auth Header	xc-token: <DEIN_API_TOKEN>

Beispiel:

bash
Code kopieren
curl -H "xc-token: <DEIN_API_TOKEN>" http://localhost:8080/api/v1/Sketchbook/Projects
🌍 Weitere wichtige Adressen
Service	URL / Adresse
NocoDB (lokal)	http://localhost:8080
GitHub Repository	https://github.com/sehetz/sketchbook.github.io
GitHub Pages (Deployment)	https://sehetz.github.io/sketchbook.github.io
Docker Data Ordner	~/nocodb/nocodb_data/

🔐 Logins & Accounts
Dienst	Benutzername	Notizen
Docker Hub	sehetz	Kostenloses Docker-Konto
NocoDB Admin	(E-Mail, die du beim Setup vergeben hast)	Zugriff auf lokale Instanz
GitHub	sehetz	Hostet die Website
