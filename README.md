# Sketchbook

## 0. Lokale Entwicklung

### Voraussetzungen
- macOS (getestet auf MacBook Pro 2021)
- Node.js (>= v22)
- npm (>= v10)
- Docker Desktop
- Git

---

### Setup

Repository klonen:
```bash
git clone https://github.com/sehetz/sketchbook.git
cd sketchbook
```

Abhängigkeiten installieren:
```bash
npm install
```

---

## Entwicklung starten

### Schritt 1 – Docker Desktop starten

Docker Desktop muss aktiv sein, bevor NocoDB läuft.

- Öffne Launchpad → suche **Docker Desktop**
- Klicke auf das Wal-Symbol 🐳
- Warte, bis in der Menüleiste steht:
  `Docker Desktop is running`

(Das dauert beim ersten Start ca. 10–30 Sekunden.)

---

### Schritt 2 – NocoDB starten

NocoDB läuft in einem Docker-Container.  
Starte ihn im Terminal:

```bash
cd ~/nocodb
docker-compose up -d
```

Dann prüfen, ob er läuft:

```bash
docker ps
```

Ergebnis sollte u. a. zeigen:
```
nocodb    nocodb/nocodb:latest   Up   0.0.0.0:8080->8080/tcp
```

→ NocoDB ist nun erreichbar unter [http://localhost:8080](http://localhost:8080)

---

### Schritt 3 – React Development Server starten

In einem **neuen Terminalfenster**:

```bash
cd ~/Documents/sketchbook
npm run dev
```

Die Website ist nun erreichbar unter:  
👉 [http://localhost:5173](http://localhost:5173)

---

### Optional: .env-Konfiguration

Erstelle im Projektverzeichnis (`sketchbook`) eine Datei `.env`  
mit folgendem Inhalt:

```
VITE_API_URL=http://localhost:8080/api/v2/tables/ma2nz1h01whlpni/records
VITE_API_TOKEN=<DEIN_API_TOKEN>
```

---

Damit ist deine komplette lokale Entwicklungsumgebung lauffähig.  
Nach jedem Neustart musst du nur:
1. Docker Desktop öffnen  
2. `docker-compose up -d` ausführen  
3. `npm run dev` starten  

---

### Online Deployment (GitHub Pages)

Nach dem Push auf den `main`-Branch wird die Seite bereitgestellt unter:  
👉 **https://sehetz.github.io/sketchbook/**

---

### TODOS

- NOCO so hosten, dass die page ausserhalb der DEV umgebung aubrufbar ist (render.com)
- purchase domain
- 