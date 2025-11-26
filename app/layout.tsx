import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { NextUIProviderWrapper } from "@/components/providers/NextUIProviderWrapper";

export const metadata: Metadata = {
  title: "InheritX HRMS - Human Resource Management System",
  description: "Modern HRMS platform for managing employees, attendance, payroll, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=document.documentElement;var t=s||((window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');d.setAttribute('data-theme',t);if(t==='dark'){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <NextUIProviderWrapper>
              <MainLayout>{children}</MainLayout>
            </NextUIProviderWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
