import { Rubik, Assistant, IBM_Plex_Sans_Hebrew } from "next/font/google";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-rubik",
});
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-assistant",
});
const plexHebrew = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-hebrew",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${assistant.variable} ${plexHebrew.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}