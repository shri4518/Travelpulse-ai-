import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/auth-context';
import { SimulationProvider } from '@/context/simulation-context';
import { DestinationProvider } from '@/context/destination-context';
import { AIChat } from '@/components/shared/AIChat';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TravelPulse AI | Intelligent Tourism Platform',
  description: 'Plan smarter journeys, discover local experiences and help destinations grow sustainably. AI-powered tourism platform for India.',
  keywords: ['Travel', 'AI', 'Tourism', 'India', 'Itinerary Planner'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500/30`}>
        <DestinationProvider>
          <AuthProvider>
            <SimulationProvider>
              <TooltipProvider>
                {children}
                <AIChat />
              </TooltipProvider>
            </SimulationProvider>
          </AuthProvider>
        </DestinationProvider>
      </body>
    </html>
  );
}
