import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";

const ibmPlexHeading = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-heading",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexBody = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-ibm-body",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Cake Family Assistant",
  description: "ผู้ช่วยครอบครัว - ตารางรับส่ง, ติดตามราคา และอื่นๆ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cake Family",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ui-theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${ibmPlexHeading.variable} ${ibmPlexBody.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
