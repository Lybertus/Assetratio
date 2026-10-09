# AssetRatio – Invest & Cash Quote Rechner (PWA)

Eine elegante, minimalistische Web-App im **Apple OLED True Black Dark Mode**, optimiert für das **iPhone 15 Pro Max** und das **MacBook Pro M4**. Berechnet in Echtzeit deine Investitions- und Cash-Quote, gibt Rebalancing-Empfehlungen und lässt sich via **GitHub Pages** direkt auf dem iPhone wie eine native App installieren.

---

## Features
- **OLED Dark Mode**: Tiefschwarzer Hintergrund (`#000000`), leuchtendes Smaragdgrün für Investiert und Cyan für Cash.
- **Interaktives Ring-Diagramm**: Dynamischer Donut-Chart wie in Apple Health / Apple Wallet.
- **2 Modi in einem**:
  - *Schnell-Rechner*: Nur 2 Felder für sofortige Quotenberechnung.
  - *Detail-Portfolio*: Aufschlüsselung nach Depots, Krypto, Tagesgeld, Notgroschen & Girokonto.
- **Rebalancing-Rechner**:
  - Wunsch-Quote einstellen (z. B. 80/20, 70/30).
  - Zeigt exakt an, wie viel Euro investiert werden sollten oder wie viel Cash aufgebaut werden muss.
  - *Cashflow-Rebalancing*: Berechnet, wie neue Sparraten oder Boni aufgeteilt werden sollten.
- **Zins- & Opportunitätskosten-Rechner (Neu)**:
  - Berechnet deinen monatlichen und jährlichen **passiven Zinsertrag** auf dein Cash (anpassbarer Tagesgeldzins).
  - Zeigt exakt deine **Opportunitätskosten** im Vergleich zur erwarteten Aktienmarktrendite (z. B. 7 % MSCI World).
  - Visueller Vergleichsbalken mit Kontextanalyse.
- **CSV- & Excel-Export / Portfolio Performance (Neu)**:
  - *Excel / Apple Numbers (CSV)*: Fertig formatiert mit Semikolon (`;`), Datumsstempel, Einzelwerten, Quoten und Zinsstatistiken.
  - *Portfolio Performance & Parqet (CSV)*: Direkt kompatibel zum Importieren deiner Depots und Konten.
- **Privatsphäre-Modus**: Ein Klick auf das Augen-Symbol verschleiert alle sensiblen Beträge in der Öffentlichkeit (Blur-Effekt).
- **Währungswahl**: Umschaltbar zwischen `€ EUR`, `$ USD` und `Fr CHF`.
- **Offline & Datensicherheit**:
  - 100% lokal im Browser (LocalStorage) gespeichert.
  - Keine externen Server oder Tracker.
  - JSON-Export & -Import für vollständige Backups.
  - Funktioniert offline dank integriertem Service Worker.

---

## 🚀 In 3 Schritten auf GitHub & GitHub Pages veröffentlichen

### Schritt 1: GitHub Repository anlegen
1. Gehe auf [github.com](https://github.com) und klicke auf **"New repository"**.
2. Wähle einen Namen (z. B. `assetratio` oder `portfolio-ratio`).
3. Setze das Repository auf **Public** (damit GitHub Pages kostenlos funktioniert) und erstelle es ohne README.

### Schritt 2: Code von deinem MacBook hochladen
Öffne das Terminal auf deinem Mac und führe folgende Befehle aus:

```bash
cd /Users/eugen/.gemini/antigravity/scratch/invest-cash-calc

# Git initialisieren
git init
git add .
git commit -m "Initial commit: AssetRatio PWA"
git branch -M main

# Mit deinem GitHub Repository verknüpfen (DEIN_BENUTZERNAME anpassen):
git remote add origin https://github.com/DEIN_BENUTZERNAME/assetratio.git

# Hochladen
git push -u origin main
```

### Schritt 3: GitHub Pages aktivieren
1. Gehe in deinem GitHub-Repository auf **Settings** (oben rechts) > **Pages** (in der linken Seitenleiste).
2. Unter **"Build and deployment"** wähle bei *Source*: **"Deploy from a branch"**.
3. Wähle Branch `main` und Folder `/ (root)` aus und klicke auf **Save**.
4. Nach ca. 30 Sekunden ist deine App unter folgendem Link live:
   `https://DEIN_BENUTZERNAME.github.io/assetratio/`

---

## 📱 Auf dem iPhone 15 Pro Max als App öffnen

1. Öffne den Link deiner GitHub-Pages-Seite in **Safari** auf deinem iPhone.
2. Tippe unten in der Leiste auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben).
3. Scrolle etwas herunter und tippe auf **"Zum Home-Bildschirm"** (Add to Home Screen).
4. Bestätige mit **"Hinzufügen"**.
5. **Fertig!** Du hast jetzt ein App-Icon auf deinem Home-Bildschirm. Die App öffnet sich im echten Vollbild-Modus ohne Adressleiste und nutzt das OLED-Display des iPhone 15 Pro Max perfekt aus.

---

## 💻 Auf dem MacBook Pro M4 öffnen

- **In Safari:** Öffne die URL und wähle im Menü oben *Ablage* > *Zum Dock hinzufügen...* – schon hast du die App direkt in deinem macOS Dock!
- **In Chrome / Brave / Edge:** Klicke in der Adressleiste auf das Installations-Symbol (App installieren).

---

## Lokaler Test auf dem Mac

Du kannst die App auch sofort ohne Upload im Browser testen:
```bash
open /Users/eugen/.gemini/antigravity/scratch/invest-cash-calc/index.html
```
