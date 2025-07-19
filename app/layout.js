import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/Providers";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Iftin Hotels",
  description: "Iftin Hotel is a hotel management system that allows you to manage your hotel in a simple and easy way.",
  icons: {
    icon: "/favicon.ico", // ✅ Keep it simple
  },
};

export default function RootLayout({ children }) {
  
  return (
   
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ClientProviders>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
        </ThemeProvider>
      </ClientProviders>
      </body>
    </html>
  );
}
