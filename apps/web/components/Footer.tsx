import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterColumn {
  sections: FooterSection[];
}

const footerMenu: FooterColumn[] = [
  {
    sections: [
      {
        title: 'About',
        links: [
          { label: 'Mission & Vision', href: '/marketing/about/mission-vision' },
          { label: 'Founding Story', href: '/marketing/about/founding-story' },
          { label: 'Team & Advisors', href: '/marketing/about/team-advisors' },
          { label: 'Governance & Transparency', href: '/marketing/about/governance-transparency' },
          { label: 'Partners & Supporters', href: '/marketing/about/partners-supporters' },
        ],
      },
    ],
  },
  {
    sections: [
      {
        title: 'Platform',
        links: [
          { label: 'How It Works', href: '/marketing/platform/how-it-works' },
          { label: 'Technology & Ethics', href: '/marketing/platform/technology-ethics' },
          { label: 'Development Roadmap', href: '/marketing/platform/development-roadmap' },
          // { label: 'Live Prototype', href: '/marketing/platform/live-prototype' },
          // { label: 'Documentation', href: '/marketing/platform/documentation' },
        ],
      },
    ],
  },
  {
    sections: [
      // {
      //   title: 'Stories',
      //   links: [
      //     { label: 'People & Places', href: '/marketing/stories/people-places' },
      //     { label: 'Multimedia Gallery', href: '/marketing/stories/multimedia-gallery' },
      //     { label: 'Community Voices', href: '/marketing/stories/community-voices' },
      //   ],
      // },
      {
        title: 'Transparency',
        links: [
          // { label: 'Financial Reports', href: '/marketing/transparency/financial-reports' },
          // { label: 'Grants & Funding', href: '/marketing/transparency/grants-funding' },
          // { label: 'Impact Metrics', href: '/marketing/transparency/impact-metrics' },
          { label: 'Policies', href: '/marketing/transparency/policies' },
        ],
      },
    ],
  },
  {
    sections: [
      {
        title: 'Participate',
        links: [
          { label: 'Join the Pilot', href: '/marketing/participate/hoka-hey' },
          // { label: 'Partner with Us', href: '/marketing/participate/partner-with-us' },
          // { label: 'Donate', href: '/marketing/participate/donate' },
          // { label: 'Newsletter', href: '/marketing/participate/newsletter' },
        ],
      },
      {
        title: 'Contact',
        links: [
          { label: 'Get in Touch', href: '/marketing/contact' },
        ],
      },
    ],
  },
];

const bottomLinks: FooterLink[] = [
  { label: 'About', href: '/marketing/about' },
  { label: 'Privacy', href: '/marketing/transparency/policies' },
  { label: 'Contact', href: '/marketing/contact' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-20">
      <div className="container max-w-screen-2xl px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerMenu.map((column, columnIndex) => (
            <div key={columnIndex}>
              {column.sections.map((section, sectionIndex) => (
                <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                  <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link 
                          href={link.href as any}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Whitepine. All rights reserved.
          </p>
          <div className="flex gap-6">
            {bottomLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href as any}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

