import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InstrumentsOfPowerPage() {
  const instruments = [
    {
      title: "Economic Veto",
      href: "/instruments-of-power/economic-veto",
      description: "An organized boycott that pools buying power to send a message that can't be ignored. When enough of us stop buying, they have to listen.",
      tags: ["Peaceful", "Your choice", "Proven", "Built-in safety stops"],
    },
    {
      title: "Primaries",
      href: "/instruments-of-power/primaries",
      description: "Challenge dishonest incumbents inside their own party. In safe districts, the real election is the primary—change the representative without waiting for the general election.",
      tags: ["Democratic", "Built into system", "Party accountability", "Grassroots power"],
    },
    {
      title: "General Elections",
      href: "/instruments-of-power/general-elections",
      description: "Field and fund independent or third-party challengers when both major parties fail to represent the electorate. Break the duopoly.",
      tags: ["Real choice", "People over parties", "Break duopoly", "Democratic legitimacy"],
    },
    {
      title: "Recall Elections",
      href: "/instruments-of-power/recall-elections",
      description: "Remove elected officials from office before their term ends when they betray the public trust. Available in 19 states for state officials, and many localities.",
      tags: ["Direct accountability", "Immediate action", "State/local tool", "Swift removal"],
    },
    {
      title: "Referenda & Initiatives",
      href: "/instruments-of-power/referenda-and-initiatives",
      description: "Bypass unresponsive representatives entirely and legislate directly. Citizens can propose new laws or veto bad ones through direct democracy.",
      tags: ["Direct democracy", "People make law", "Bypass gridlock", "Popular sovereignty"],
    },
    {
      title: "Petitions",
      href: "/instruments-of-power/petitions",
      description: "Demand specific commitments or resignations through formal requests signed by multiple people. Protected by the First Amendment right to petition.",
      tags: ["Constitutional right", "Accessible", "Builds momentum", "Shows unity"],
    },
    {
      title: "Demonstrations",
      href: "/instruments-of-power/demonstrations",
      description: "Direct, lawful expression of organized disapproval through protests, marches, rallies, and vigils. Public displays of collective sentiment.",
      tags: ["First Amendment", "Peaceful assembly", "Visible pressure", "Community solidarity"],
    },
    {
      title: "Strikes",
      href: "/instruments-of-power/strikes",
      description: "Withhold labor to force accountability. The collective refusal to work until specific demands are met—one of the most powerful tools available to workers.",
      tags: ["Worker power", "Economic pressure", "Collective action", "Protected right"],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Instruments of Power
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          When representatives fail to serve the people, citizens have powerful tools to restore accountability. 
          These are peaceful, lawful instruments of democratic power.
        </p>
      </section>

      {/* Instruments Grid */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {instruments.map((instrument) => (
            <div
              key={instrument.href}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                {instrument.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {instrument.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {instrument.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={instrument.href as any}>
                  Learn More →
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to take action?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          These instruments work best when used strategically and in combination. Join Whitepine to coordinate 
          collective action with other citizens who are committed to democratic accountability.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/join">Join Whitepine</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/charter">Read the Charter</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

