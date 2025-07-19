import { SessionProvider } from 'next-auth/react';
import { auth } from "@/auth";
import { SocketProvider } from "@/context/SocketContext";
import "./globals.css";
import { ThemeProvider } from '@/components/theme-provider';

export const metadata = {
  title: "Ylack - Team Communication Platform",
  description: "A modern team communication platform for remote teams",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <SocketProvider>
              {children}
            </SocketProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
