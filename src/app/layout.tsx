import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import { SCRIPT_TEMA } from './contexts/ThemeContext';

export const metadata: Metadata = {
  title: { default: 'Portal Malpo', template: '%s · Portal Malpo' },
  description: 'Portal del trabajador de Constructora Malpo: asistencia, solicitudes, documentos y reportes.',
  icons: { icon: '/icono.png' },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#931022' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,500..800&family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
