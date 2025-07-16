import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/common/provider/authProvider";
import { UserProvider } from "@/common/provider/userProvider";

export const metadata: Metadata = {
  title: "Short.ly - URL Shortener",
  description: "Fast, reliable URL shortening service with analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}