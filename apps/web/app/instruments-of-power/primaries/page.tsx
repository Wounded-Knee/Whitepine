import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrimariesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Primary Elections
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Challenge dishonest incumbents inside their own party
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Democratic
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Built into the system
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Party accountability
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Peaceful transition
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/join">Join Whitepine</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/charter">Read the Charter</Link>
          </Button>
        </div>
      </section>

      {/* What it is */}
      <section id="what-it-is" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          What is this?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Primary elections let party members choose who represents them in the general election. 
          When an incumbent isn&apos;t serving the people, primaries are your chance to replace them with someone better—from within their own party.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          This is often more effective than waiting for the general election, because the winner is almost guaranteed 
          in districts dominated by one party. The real choice happens in the primary.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Early intervention
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Party reform
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Grassroots power
          </span>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          How to use primaries effectively
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Identify the Problem
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Document specific instances where your representative has failed to represent constituent interests. 
              Gather voting records, public statements, and policy positions.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Track voting records
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Document promises vs. actions
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Survey constituents
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Find a Strong Challenger
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Recruit or support a primary challenger who shares the party&apos;s values but better represents the district. 
              Look for candidates with integrity, relevant experience, and genuine commitment to constituent needs.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Community leaders
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Proven track record
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear platform
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Build the Campaign
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Primary campaigns require grassroots organizing: door-knocking, phone banking, social media outreach, 
              and local fundraising. Focus on motivating base voters who actually participate in primaries.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Volunteer recruitment
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Small-donor fundraising
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Voter registration drives
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Get Out the Vote
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Primary turnout is typically low, so every vote matters. Identify your supporters, make sure they&apos;re 
              registered, remind them of election day, and help with transportation if needed.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Contact lists
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Reminders and rides
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Poll monitoring
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section id="advantages" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Why primaries are powerful
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Bypass partisan gridlock
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              In safe districts, the real election is the primary. Change the representative without waiting for 
              the unlikely event of the other party winning.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Hold parties accountable
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Parties must listen to their members. A successful primary challenge sends a clear message about 
              what the base will and won&apos;t tolerate.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Lower barrier to entry
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Primary challengers can run on smaller budgets and with grassroots support, because they&apos;re 
              only competing within one party.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Reform from within
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Primary challenges improve both parties by replacing poor performers while maintaining 
              ideological consistency.
            </p>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section id="challenges" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Common challenges
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Low turnout
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Primary elections typically see very low voter participation, which means organized campaigns 
              have outsized impact—but you must mobilize your supporters to actually vote.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Incumbent advantages
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Incumbents have name recognition, fundraising networks, and party support. Challengers must work 
              harder and smarter to overcome these built-in advantages.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibent text-gray-900 dark:text-white mb-3">
              Party resistance
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Party establishments often protect incumbents and may actively oppose primary challengers. 
              You&apos;ll need grassroots strength to overcome institutional resistance.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Common questions
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Who can vote in primaries?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              It depends on your state. Some have &quot;closed&quot; primaries (only registered party members), 
              some have &quot;open&quot; primaries (anyone can vote), and some are in between. Check your state&apos;s rules.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              When do primaries happen?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Primary dates vary by state, typically occurring in spring and early summer before general 
              elections in November. Presidential primaries start even earlier.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Can anyone run in a primary?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Generally yes, though requirements vary: candidate must usually be a party member, collect petition 
              signatures, pay a filing fee, and meet age/residency requirements for the office.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What about party unity?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Primaries are the mechanism for internal party debate and accountability. When conducted respectfully, 
              they strengthen parties by ensuring representatives truly reflect their constituents.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to take action?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Find your local primary dates, register to vote, and support candidates who will truly represent you.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/join">Join Whitepine</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/instruments-of-power">More Tools</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

