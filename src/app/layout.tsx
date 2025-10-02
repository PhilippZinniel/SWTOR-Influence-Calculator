import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'SWTOR Influence Calculator',
  description: 'Calculate the optimal companion gifts to level up your influence in SWTOR.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Image
          src="https://picsum.photos/seed/space/1920/1080"
          alt="Starry background"
          fill
          className="-z-10 object-cover opacity-20"
          data-ai-hint="space stars"
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
