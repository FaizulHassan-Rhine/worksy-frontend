import { Plus_Jakarta_Sans } from "next/font/google";
import ThemeScript from "@/components/ThemeScript";
import AppProviders from "@/components/providers/AppProviders";
import { APP_DESCRIPTION, APP_NAME } from "@/constants/branding";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: `${APP_NAME} — Work Management`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} light h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
