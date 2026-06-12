import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';

export const metadata: Metadata = {
  title: 'AI Startup Simulator — Build Your Virtual Empire',
  description: 'Simulate your startup\'s growth with AI-powered customer behavior, revenue modeling, investor reactions, and competitive dynamics in real-time.',
  keywords: ['startup simulator', 'AI simulation', 'SaaS', 'entrepreneur', 'business simulation'],
  openGraph: {
    title: 'AI Startup Simulator',
    description: 'Build and simulate your virtual startup with real AI',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
