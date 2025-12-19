# 🚀 DEPLOYMENT SETUP – sehetz.ch

**Status:** ⏳ Noch nicht deployed (geplant)  
**Zielkonfiguration:**
- Frontend: GitHub Pages (React/Vite Build)
- Backend: NocoDB auf Render
- Datenbank: PostgreSQL auf Render
- Domain: sehetz.ch (bei Hostpoint)

---

## 🎯 ARCHITEKTUR

```
sehetz.ch 
  ↓ (DNS → GitHub Pages)
GitHub Pages (dist/ – React Build)
  ↓
API Calls → NocoDB auf Render
  ↓
PostgreSQL auf Render (Datenbank)
```

**Kosten:** €0 (außer Domain bei Hostpoint, die zahlt du ohnehin)

---

## 📋 PHASE 1: VORBEREITUNG (Lokal)

### 1.1 Git Repo initialisieren
```bash
cd /Users/sarahcarnault/Documents/sketchbook
git init
git add .
git commit -m "Initial commit"
```

### 1.2 CNAME-Datei erstellen
Datei: `public/CNAME`
```
sehetz.ch
```

### 1.3 package.json aktualisieren
Öffne `package.json` und ergänze Homepage:
```json
{
  "name": "sehetz.ch",
  "private": true,
  "homepage": "https://sehetz.ch",
  ...
}
```

### 1.4 Build testen
```bash
npm run build
# Prüfe: dist/ Ordner existiert und enthält index.html
```

---

## 🔐 PHASE 2: RENDER SETUP (Backend + DB)

### 2.1 PostgreSQL Datenbank erstellen
1. Gehe zu [render.com](https://render.com)
2. Sign up (kostenlos)
3. "New" → "PostgreSQL"
4. Name: `sehetz-db`
5. Region: `Frankfurt (EU-Central)` ← Wähle das!
6. Plan: **Free** (512 MB)
7. Deploy
8. **Speichere die Connection String!** (z.B. `postgresql://user:pass@host:port/dbname`)

### 2.2 NocoDB deployen
1. "New" → "Web Service"
2. Repository: `nocodb/nocodb` (oder einen Docker-Hub Link)
3. Name: `sehetz-noco`
4. Region: `Frankfurt (EU-Central)`
5. Plan: **Free**
6. Build command: (leer – Docker Image)
7. Start command: (leer – Docker default)
8. Environment Variables hinzufügen:
   ```
   DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]
   NC_AUTH_JWT_SECRET=your-super-secret-key-here-min-32-chars
   ```
9. Deploy

### 2.3 NocoDB testen
- Warte ~5 Min auf Deploy
- Öffne `https://sehetz-noco.onrender.com`
- Melde dich an + erstelle einen Benutzer

### 2.4 API Token generieren
In NocoDB:
1. Account Settings → Tokens
2. Neuen Token erstellen: `sehetz-frontend`
3. **Copy den Token** → später in `.env.production` einfügen

### 2.5 API URL kopieren
```
VITE_API_URL=https://sehetz-noco.onrender.com/api/v1/db/[deine-table-id]
VITE_NOCO_BASE_URL=https://sehetz-noco.onrender.com
```

---

## 🌐 PHASE 3: GITHUB SETUP (Frontend)

### 3.1 GitHub Repository erstellen
1. Gehe zu [github.com](https://github.com)
2. "New repository"
3. Name: `sehetz` (oder wie du magst)
4. Public (notwendig für GitHub Pages)
5. Create repository

### 3.2 Lokal zu GitHub pushen
```bash
git remote add origin https://github.com/[dein-username]/sehetz.git
git branch -M main
git push -u origin main
```

### 3.3 GitHub Actions Workflow erstellen
Datei: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_API_TOKEN: ${{ secrets.VITE_API_TOKEN }}
          VITE_NOCO_BASE_URL: ${{ secrets.VITE_NOCO_BASE_URL }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 3.4 GitHub Secrets setzen
1. Repository → Settings → Secrets and variables → Actions
2. New secret erstellen für jede Variable:
   ```
   VITE_API_URL = https://sehetz-noco.onrender.com/api/v1/db/[...]
   VITE_API_TOKEN = [dein-noco-token]
   VITE_NOCO_BASE_URL = https://sehetz-noco.onrender.com
   ```

### 3.5 GitHub Pages aktivieren
1. Repository → Settings → Pages
2. Source: "GitHub Actions"
3. Branch: (bleibt auto)
4. Warte ~5 Min → GitHub deploymt automatisch!

---

## 🔗 PHASE 4: HOSTPOINT DNS KONFIGURATION

### 4.1 Hostpoint DNS öffnen
1. Hostpoint Kundenportal → sehetz.ch → DNS Manager
2. Oder direkt: [hostpoint.ch DNS](https://www.hostpoint.ch)

### 4.2 DNS Records hinzufügen

**Option A: Mit WWW (einfacher)**
```
Name: www
Type: CNAME
Target: [dein-github-username].github.io
TTL: 3600
```

Dann erreichbar via: `www.sehetz.ch`

**Option B: Root Domain (ohne WWW)**
```
Name: @
Type: A
Target: 185.199.108.153

Name: @
Type: A
Target: 185.199.109.153

Name: @
Type: A
Target: 185.199.110.153

Name: @
Type: A
Target: 185.199.111.153
```

Dann erreichbar via: `sehetz.ch`

### 4.3 DNS Propagation warten
- Kann 5 Min bis 24h dauern
- Test: `ping sehetz.ch` oder `nslookup sehetz.ch`

### 4.4 GitHub Pages Custom Domain bestätigen
1. Repository → Settings → Pages
2. "Custom domain" → `sehetz.ch` eingeben
3. GitHub erstellt automatisch SSL-Zertifikat ✅

---

## 🧪 PHASE 5: TESTING & LIVE

### 5.1 Deployment testen
```bash
# Lokal build testen
npm run build
npm run preview

# Öffne http://localhost:4173
# Prüfe: Alle Assets laden, API funktioniert
```

### 5.2 Live testen
1. Öffne `https://sehetz.ch`
2. Prüfe alle Pages / Links funktionieren
3. Öffne DevTools → Network → Prüfe API Calls
4. Ändere etwas in NocoDB → Prüfe ob es sich nach 30s auf der Website aktualisiert ✅

### 5.3 Render Cold-Start verhindern
Optional: UptimeRobot ping (verhindert schlafen):
1. [uptimerobot.com](https://uptimerobot.com) kostenlos
2. Monitor: `https://sehetz-noco.onrender.com`
3. Interval: 10 Minuten
4. NocoDB schläft jetzt nie ein ✅

---

## 📝 CHECKLISTE ZUM ABHAKEN

**PHASE 1 – Vorbereitung:**
- [ ] Git repo initialisiert
- [ ] `public/CNAME` erstellt
- [ ] `package.json` mit homepage
- [ ] `npm run build` funktioniert

**PHASE 2 – Render:**
- [ ] PostgreSQL Datenbank deployed
- [ ] NocoDB auf Render deployed
- [ ] NocoDB lädt: `https://sehetz-noco.onrender.com`
- [ ] API Token generiert
- [ ] API URL notiert

**PHASE 3 – GitHub:**
- [ ] GitHub Repo erstellt
- [ ] `.github/workflows/deploy.yml` erstellt
- [ ] GitHub Secrets gesetzt
- [ ] GitHub Pages aktiviert
- [ ] Deploy erfolgreich (grüner Haken in Actions)

**PHASE 4 – DNS:**
- [ ] Hostpoint DNS Records eingetragen
- [ ] DNS Propagation überprüft
- [ ] GitHub Pages Custom Domain bestätigt

**PHASE 5 – Live:**
- [ ] `https://sehetz.ch` öffnet
- [ ] Alle Pages funktionieren
- [ ] NocoDB API Calls funktionieren
- [ ] Live CMS Updates testen (30s refresh)

---

## 🆘 TROUBLESHOOTING

### Problem: GitHub Actions fehlgeschlagen
**Lösung:**
```bash
# Lokal testen
npm run build
# Wenn lokal funktioniert → Secrets überprüfen
```

### Problem: `sehetz.ch` zeigt 404
**Lösung:**
- DNS Propagation abwarten (bis 24h)
- `nslookup sehetz.ch` überprüfen
- GitHub Pages Custom domain überprüfen

### Problem: NocoDB antwortet nicht
**Lösung:**
- Render Logs überprüfen
- PostgreSQL connection string korrekt?
- `NC_AUTH_JWT_SECRET` gesetzt?

### Problem: API Calls funktionieren nicht
**Lösung:**
- VITE_API_URL korrekt in GitHub Secrets?
- VITE_API_TOKEN gültig?
- CORS aktiviert in NocoDB?

---

## 📚 NÜTZLICHE LINKS

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Render Documentation](https://render.com/docs)
- [NocoDB API Docs](https://docs.nocodb.com/rest-apis/overview)
- [Hostpoint DNS Docs](https://www.hostpoint.ch/hilfe)

---

## 💡 NÄCHSTE SCHRITTE NACH DEPLOYMENT

- [ ] Monitoring einrichten (UptimeRobot)
- [ ] Backups einrichten (Render PostgreSQL)
- [ ] Analytics hinzufügen (optional)
- [ ] SEO optimieren (meta tags)
- [ ] Performance testen (Lighthouse)

---

**Viel Erfolg beim Deployment! 🚀**

Bei Fragen: Schau den Workflow durch & teste Schritt für Schritt.
