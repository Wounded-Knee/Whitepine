import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ReferendaAndInitiativesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Referenda and Initiatives
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Bypass unresponsive representatives and legislate directly
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Direct democracy
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            People make law
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Bypass gridlock
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Popular sovereignty
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
          <strong>Initiatives</strong> allow citizens to propose new laws or constitutional amendments and place them on the ballot 
          for voters to approve directly. <strong>Referenda</strong> let voters approve or reject laws passed by the legislature, 
          or refer questions to the voters.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          These tools of direct democracy give citizens the power to make policy when their representatives won&apos;t—or 
          to overturn bad legislation. They&apos;re available in about half of U.S. states and many localities.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Legislative power
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Check on government
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Citizen empowerment
          </span>
        </div>
      </section>

      {/* Types */}
      <section id="types" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Types of direct democracy
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Citizen Initiative (Direct)
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Citizens draft a proposed law, collect signatures, and if they gather enough, the measure goes 
              directly on the ballot. Voters decide. No legislative involvement required. Available in 24 states.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Citizens draft law
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Collect signatures
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Voters decide
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Indirect Initiative
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Similar to direct initiative, but after signatures are gathered, the measure first goes to the legislature. 
              If the legislature doesn&apos;t act or modifies it, then it goes to the ballot. Available in 8 states.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legislature reviews first
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Collaborative option
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Ballot if needed
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Popular Referendum (Veto Referendum)
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              After the legislature passes a law, citizens can collect signatures to force a vote on whether to 
              keep or repeal it. This is a direct check on legislative power. Available in 24 states.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Challenge new laws
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Popular veto
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legislative check
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Legislative Referendum
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The legislature itself refers a question to voters—either because it&apos;s required (like constitutional 
              amendments in most states) or because lawmakers want voter input on a controversial issue.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legislature initiates
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Required for amendments
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Voter approval
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section id="how-to-use" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          How to run a successful initiative campaign
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Draft Your Measure
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Work with legal experts to draft clear, enforceable language. The measure must be legally sound, 
              comply with all state requirements (single-subject rule, etc.), and be understandable to voters.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Legal review
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Clear language
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Compliance check
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Get Official Approval
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Submit your measure to the appropriate state office (usually Secretary of State). They&apos;ll review 
              it for legal compliance and provide the official petition format you must use.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                File paperwork
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Official review
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Get petition form
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Collect Signatures
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This is the hardest part. Most states require signatures equal to 5-15% of voters from the last 
              election, gathered within 90-180 days. You&apos;ll need hundreds or thousands of volunteers, or paid 
              signature gatherers (if allowed).
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Volunteer recruitment
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Exceed threshold
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Time management
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Verification and Qualification
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Election officials verify signatures. Expect 20-30% rejection rate for invalid signatures. If you 
              qualify, your measure is assigned a ballot number and scheduled for the next election.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Signature verification
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Qualification
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Ballot placement
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Run the Campaign
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Now you must persuade voters. Expect well-funded opposition from interest groups that benefit from 
              the status quo. Build coalitions, raise money, run ads, and educate voters about your measure.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Voter education
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Coalition building
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Full campaign
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Implementation and Defense
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you win, opponents may challenge your measure in court or the legislature may try to amend or 
              repeal it. Be prepared to defend your victory and ensure proper implementation.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Legal defense
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Monitor implementation
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Protect victory
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          What citizens have achieved
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Citizen initiatives have enacted major policy changes that legislatures refused to pass:
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Minimum wage increases
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Multiple states have raised minimum wages through ballot initiatives when legislatures wouldn&apos;t act.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Cannabis legalization
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Most legal cannabis states achieved it through citizen initiatives, not legislative action.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Electoral reforms
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ranked-choice voting, redistricting reform, and campaign finance limits have passed through initiatives.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Tax and spending limits
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Citizens have used initiatives to limit government spending, require voter approval for taxes, and more.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Environmental protection
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Clean energy mandates, pollution controls, and conservation measures passed via direct democracy.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Civil rights
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Marriage equality, anti-discrimination laws, and other civil rights protections have been both 
              advanced and attacked through initiatives.
            </p>
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section id="challenges" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Challenges and concerns
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Money matters
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Signature gathering and campaigns cost millions. Well-funded special interests can dominate the process, 
              though grassroots campaigns do sometimes prevail.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Complexity
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Some issues are too complex for yes/no votes. Poorly drafted initiatives can have unintended consequences. 
              Careful drafting and voter education are essential.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Minority rights
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Direct democracy can be used to restrict minority rights. Courts provide some protection, but vigilance 
              is needed to prevent tyranny of the majority.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Voter confusion
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ballots with many measures can overwhelm voters. Confusing language or deceptive campaigns can mislead. 
              Clear communication and honest advocacy are crucial.
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
              Does my state allow initiatives?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              24 states allow citizen-initiated measures. Many more allow them at the local level. Check your state&apos;s 
              constitution and local charter.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Can the legislature overturn our initiative?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Depends on the state. Some prohibit legislative repeal for a period of time; others allow it. 
              Constitutional initiatives are harder to overturn than statutory ones.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How much does it cost?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              For statewide initiatives: $1-10 million or more for signature gathering and campaigns. Local measures 
              cost less. Costs depend on paid vs. volunteer signature gathering and opposition funding.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What if we don&apos;t have initiative rights?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Advocate for adopting them. Several states have added initiative rights through constitutional amendments. 
              Meanwhile, focus on other tools: elections, petitions, and public pressure.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Make law directly
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          When representatives won&apos;t act, take legislative power into your own hands.
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

