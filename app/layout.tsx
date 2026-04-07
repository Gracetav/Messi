import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { CartProvider } from "../components/CartContext";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgyParts - E-commerce Sparepart Otomotif",
  description: "Cari sparepart otomotif berkualitas dengan harga terbaik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: {
                      DEFAULT: "#16a34a",
                      hover: "#15803d",
                      light: "#dcfce7",
                      dark: "#14532d",
                    },
                    secondary: "#22c55e",
                  },
                  fontFamily: {
                    poppins: ["var(--font-poppins)", "sans-serif"],
                  },
                }
              }
            }
          `
        }} />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased bg-slate-50 text-slate-900`}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
