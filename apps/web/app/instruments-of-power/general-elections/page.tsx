import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GeneralElectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          General Elections
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Field and fund independent or third-party challengers when both major parties fail
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Break the duopoly
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Real choice
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            People over parties
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Democratic legitimacy
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
          When both major party candidates fail to represent the electorate, general elections offer the opportunity 
          to field independent or third-party challengers who will actually serve the people.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          While the two-party system creates structural barriers, coordinated grassroots support can break through—especially 
          in local and state elections where organized communities can compete with party machines.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Accountability
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            True representation
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Strategic disruption
          </span>
        </div>
      </section>

      {/* Strategy */}
      <section id="strategy" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Strategic approach
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Identify Winnable Races
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Start local: city council, school board, state legislature. These races require fewer resources and 
              have lower barriers to entry. Build a track record before attempting federal offices.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Local first
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Analyze competitiveness
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Build momentum
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Recruit Quality Candidates
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Look for people with integrity, relevant experience, community ties, and genuine commitment to service. 
              They don&apos;t need party machinery—they need authentic connection to constituents.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Community leaders
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Issue expertise
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Personal integrity
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Build Coalition Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Independent candidates succeed by building coalitions across party lines—people who are fed up with 
              both parties and ready for something different. Focus on issues, not ideology.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Cross-partisan appeal
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Issue-focused
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Broad coalitions
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Run Professional Campaigns
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Third-party and independent campaigns must be even more professional than major party campaigns. 
              Meet all legal requirements, raise funds transparently, communicate clearly, and organize effectively.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legal compliance
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Transparent fundraising
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Strategic messaging
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Overcoming Barriers */}
      <section id="barriers" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Overcoming structural barriers
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Ballot access
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Each state has different rules for getting on the ballot. Research requirements early: petition signatures, 
              filing deadlines, and fees. Organize volunteers specifically for this task.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Media coverage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Media often ignores third-party candidates. Compensate with strong social media presence, earned media 
              through newsworthy events, and direct voter contact like door-knocking.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Fundraising
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Without party infrastructure, independent candidates must build grassroots fundraising networks. 
              Focus on small-dollar donors, transparent accounting, and demonstrating fiscal responsibility.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Voter psychology
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Many voters fear &quot;wasting&quot; their vote. Counter this by demonstrating viability through polls, 
              endorsements, and crowd sizes. Make voting for you feel like joining a movement.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Debate access
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Debate rules often exclude third parties. Push for inclusion, file complaints if rules are unfair, 
              and host alternative forums to showcase your candidate.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Electoral systems
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              First-past-the-post voting makes third parties difficult. Advocate for ranked-choice voting and 
              other electoral reforms while running strategic campaigns where you can win.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          It can be done
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Independent and third-party candidates have won at every level of government. Bernie Sanders (I-VT), 
          Angus King (I-ME), and many mayors and city council members prove it&apos;s possible with the right 
          strategy and grassroots support.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            Local victories
          </span>
          <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            State-level success
          </span>
          <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            Federal representation
          </span>
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
              Isn&apos;t this just splitting the vote?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Only if you assume voters &quot;belong&quot; to one party or another. When both parties fail, voters 
              deserve a real choice. The goal is to win, not to play spoiler.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Can independents really win?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yes, especially in local and state races. Even when they don&apos;t win, strong showings force major 
              parties to address issues they were ignoring.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What about party resources?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Party resources come with party control. Independent candidates trade institutional support for freedom 
              to truly represent their constituents without answering to party bosses.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How do we fund these campaigns?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Grassroots fundraising from small donors, transparent crowdfunding, and coalition support from groups 
              and individuals tired of the two-party system.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to break the duopoly?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Support independent candidates who will put people before parties.
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

