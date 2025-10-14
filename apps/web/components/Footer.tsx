import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-20">
      <div className="container max-w-screen-2xl px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-semibold text-lg mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketing/about/mission-vision" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mission & Vision
                </Link>
              </li>
              <li>
                <Link href="/marketing/about/founding-story" className="text-muted-foreground hover:text-foreground transition-colors">
                  Founding Story
                </Link>
              </li>
              <li>
                <Link href="/marketing/about/team-advisors" className="text-muted-foreground hover:text-foreground transition-colors">
                  Team & Advisors
                </Link>
              </li>
              <li>
                <Link href="/marketing/about/governance-transparency" className="text-muted-foreground hover:text-foreground transition-colors">
                  Governance & Transparency
                </Link>
              </li>
              <li>
                <Link href="/marketing/about/partners-supporters" className="text-muted-foreground hover:text-foreground transition-colors">
                  Partners & Supporters
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketing/platform/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/marketing/platform/technology-ethics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Technology & Ethics
                </Link>
              </li>
              <li>
                <Link href="/marketing/platform/development-roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
                  Development Roadmap
                </Link>
              </li>
              <li>
                <Link href="/marketing/platform/live-prototype" className="text-muted-foreground hover:text-foreground transition-colors">
                  Live Prototype
                </Link>
              </li>
              <li>
                <Link href="/marketing/platform/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Stories + Transparency */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stories</h3>
            <ul className="space-y-2 mb-6">
              <li>
                <Link href="/marketing/stories/people-places" className="text-muted-foreground hover:text-foreground transition-colors">
                  People & Places
                </Link>
              </li>
              <li>
                <Link href="/marketing/stories/multimedia-gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                  Multimedia Gallery
                </Link>
              </li>
              <li>
                <Link href="/marketing/stories/community-voices" className="text-muted-foreground hover:text-foreground transition-colors">
                  Community Voices
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-lg mb-4">Transparency</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketing/transparency/financial-reports" className="text-muted-foreground hover:text-foreground transition-colors">
                  Financial Reports
                </Link>
              </li>
              <li>
                <Link href="/marketing/transparency/grants-funding" className="text-muted-foreground hover:text-foreground transition-colors">
                  Grants & Funding
                </Link>
              </li>
              <li>
                <Link href="/marketing/transparency/impact-metrics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Impact Metrics
                </Link>
              </li>
              <li>
                <Link href="/marketing/transparency/policies" className="text-muted-foreground hover:text-foreground transition-colors">
                  Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Participate + Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Participate</h3>
            <ul className="space-y-2 mb-6">
              <li>
                <Link href="/marketing/participate/join-pilot" className="text-muted-foreground hover:text-foreground transition-colors">
                  Join the Pilot
                </Link>
              </li>
              <li>
                <Link href="/marketing/participate/partner-with-us" className="text-muted-foreground hover:text-foreground transition-colors">
                  Partner with Us
                </Link>
              </li>
              <li>
                <Link href="/marketing/participate/donate" className="text-muted-foreground hover:text-foreground transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/marketing/participate/newsletter" className="text-muted-foreground hover:text-foreground transition-colors">
                  Newsletter
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/marketing/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Get in Touch
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Whitepine. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/marketing/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/marketing/transparency/policies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/marketing/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

