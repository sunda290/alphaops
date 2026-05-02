import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const GA_ID = 'G-R62RKJMNMB'

export const metadata: Metadata = {
  metadataBase: new URL('https://alphaops.cloud'),
  title: 'André Oliveira — Automação Operacional',
  description: 'Sistemas sob medida que eliminam trabalho manual do seu negócio — usando IA e Full Stack — para que você pare de operar e comece a crescer.',
  openGraph: {
    title:       'André Oliveira — Automação Operacional',
    description: 'Sistemas sob medida que eliminam trabalho manual do seu negócio.',
    url:         'https://alphaops.cloud',
    siteName:    'André Oliveira',
    images: [
      {
        url:    '/og-image.png',
        width:  1200,
        height: 630,
        alt:    'André Oliveira — Automação Operacional',
      },
    ],
    locale: 'pt_BR',
    type:   'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'André Oliveira — Automação Operacional',
    description: 'Sistemas sob medida que eliminam trabalho manual do seu negócio.',
    images:      ['/og-image.png'],
  },
  robots: {
    index:  true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700;800;900&family=Barlow:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}

        {/* Google Analytics 4 — substituir G-XXXXXXXXXX pelo seu Measurement ID */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  )
}
