import Link from 'next/link';
import { Compass, Mail, Globe, MessageSquare } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Travel<span className="text-gradient-forest">Pulse</span>{' '}
                <span className="text-muted-foreground font-normal text-sm">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intelligent Tourism. Connected Experiences. Stronger Local Economies.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/trip-planner" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trip Planner</Link></li>
              <li><Link href="/map" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Digital Twin Map</Link></li>
              <li><Link href="/businesses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Local Businesses</Link></li>
              <li><Link href="/impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Impact Tracker</Link></li>
            </ul>
          </div>

          {/* For Stakeholders */}
          <div>
            <h4 className="text-sm font-semibold mb-4">For Stakeholders</h4>
            <ul className="space-y-2">
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tourists</Link></li>
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hotel Owners</Link></li>
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Local Guides</Link></li>
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tourism Authorities</Link></li>
            </ul>
          </div>

          {/* Destination */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Coverage</h3>
            <p className="text-sm text-muted-foreground mb-2">Across India</p>
            <p className="text-sm text-muted-foreground mb-4">Expanding globally soon.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TravelPulse AI — Smart India Hackathon Innovation Project
          </p>
          <p className="text-xs text-muted-foreground">
            Demo data for prototype purposes. Not a production service.
          </p>
        </div>
      </div>
    </footer>
  );
}
