import Link from 'next/link';
import { Home, Globe, Facebook, Twitter, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/help/safety" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Safety Information</Link></li>
              <li><Link href="/help/cancellation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancellation Options</Link></li>
              <li><Link href="/help/accessibility" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Accessibility</Link></li>
              <li><Link href="/help/report" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Report a Concern</Link></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Hosting</h3>
            <ul className="space-y-3">
              <li><Link href="/host/get-started" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Host Your Home</Link></li>
              <li><Link href="/host/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Hosting Resources</Link></li>
              <li><Link href="/host/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community Forum</Link></li>
              <li><Link href="/host/responsible" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Responsible Hosting</Link></li>
            </ul>
          </div>

          {/* StayScape */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">StayScape</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="/press" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
              <li><Link href="/investors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Investors</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
              <li><Link href="/sitemap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sitemap</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} StayScape, Inc. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="h-4 w-4" /> English (US)
            </button>
            <span className="text-sm text-muted-foreground">$ USD</span>
            <div className="flex items-center gap-3">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
