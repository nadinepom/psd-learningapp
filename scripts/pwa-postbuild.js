/**
 * PWA Post-Build Script
 * Läuft nach `expo export -p web` und macht den dist-Ordner PWA-fähig:
 * 1. Kopiert das App-Icon zu vorhersagbaren Pfaden
 * 2. Erstellt manifest.json
 * 3. Injiziert PWA-Meta-Tags in index.html (da Expo's +html.tsx diese im statischen Build filtert)
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const iconSrc = path.join(__dirname, '../assets/images/icon.png');

// 1. Icon zu festen Pfaden kopieren
fs.copyFileSync(iconSrc, path.join(distDir, 'apple-touch-icon.png'));
fs.copyFileSync(iconSrc, path.join(distDir, 'icon-512.png'));
fs.copyFileSync(iconSrc, path.join(distDir, 'icon-192.png'));
console.log('✓ Icons kopiert');

// 2. manifest.json erstellen
const manifest = {
  name: 'PSD Learning',
  short_name: 'PSD',
  description: 'Professional Scrum Developer Lernapp – lerne PSD-Fragen effektiv mit Wiederholung und Lernstandspeicherung.',
  start_url: '/',
  display: 'standalone',
  background_color: '#E6F4FE',
  theme_color: '#1565C0',
  orientation: 'portrait',
  lang: 'de',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: '/apple-touch-icon.png', sizes: '1024x1024', type: 'image/png' },
  ],
};
fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('✓ manifest.json erstellt');

// 3. PWA-Tags in index.html injizieren (und in alle anderen HTML-Seiten)
const htmlFiles = fs.readdirSync(distDir).filter((f) => f.endsWith('.html'));
const pwaTags = `
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="PSD Learning">
    <meta name="theme-color" content="#1565C0">
    <meta name="mobile-web-app-capable" content="yes">`;

for (const file of htmlFiles) {
  const filePath = path.join(distDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // viewport-fit=cover ergänzen falls noch nicht vorhanden
  html = html.replace(
    /(<meta name="viewport" content="[^"]*)"(\s*\/>)/,
    (match, before) => {
      if (match.includes('viewport-fit')) return match;
      return `${before}, viewport-fit=cover"$2`;
    }
  );

  // PWA-Tags vor </head> einfügen (nur einmal)
  if (!html.includes('rel="manifest"')) {
    html = html.replace('</head>', `${pwaTags}\n</head>`);
  }

  fs.writeFileSync(filePath, html);
}
console.log(`✓ PWA-Tags in ${htmlFiles.length} HTML-Datei(en) injiziert`);
console.log('✓ PWA Post-Build abgeschlossen');
