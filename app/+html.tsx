import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Dieses Template wird nur für den Web-Build verwendet.
 * Hier werden Schriften und Icons per CSS geladen – zuverlässiger als JS-basiertes Laden.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Fira Sans von Google Fonts – ersetzt expo-google-fonts auf Web */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />

        {/* Safe Area: Hintergrundfarbe hinter Notch/Statusleiste auf iPhone PWA */}
        <style>{`
          html, body {
            background-color: #E6F4FE;
            height: 100%;
          }
          /* Notch-Bereich oben mit App-Hintergrundfarbe füllen */
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
