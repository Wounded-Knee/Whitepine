import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PetitionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Petitions
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Demand specific commitments or resignations
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            First Amendment right
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Accessible
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Builds momentum
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Shows unity
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
          A petition is a formal request signed by multiple people, demanding that officials take (or stop taking) 
          a specific action. Petitions are protected by the First Amendment&apos;s right &quot;to petition the Government 
          for a redress of grievances.&quot;
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          While petitions alone rarely force change, they serve critical functions: demonstrating public support, 
          building coalitions, getting media attention, and creating a record of demands that can support other 
          forms of action.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Constitutional right
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Coalition building
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Public pressure
          </span>
        </div>
      </section>

      {/* Types */}
      <section id="types" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Types of petitions
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Advocacy petitions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Request specific policy changes or actions. These demonstrate public support for an issue and 
              put officials on notice that constituents care.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Resignation petitions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Demand that an official resign from office due to misconduct, incompetence, or betrayal of public trust. 
              No legal force, but powerful political pressure.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Ballot petitions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Legally required signature gathering to place initiatives, referenda, or recall elections on the ballot. 
              These have legal force once qualified.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Redress petitions
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Request investigation, hearing, or remedy for specific grievances. Can be directed at any level 
              of government or even private entities.
            </p>
          </div>
        </div>
      </section>

      {/* How to Create */}
      <section id="how-to-create" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          How to create an effective petition
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Clear and Specific Demands
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              State exactly what you want. Vague petitions are easy to ignore. Be concrete: &quot;Vote yes on Bill 
              X,&quot; &quot;Repeal Policy Y,&quot; &quot;Resign from office,&quot; etc. Include deadlines when appropriate.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Specific action
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear deadline
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Measurable outcome
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Compelling Rationale
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Explain why your demand is justified. Provide facts, evidence, and context. Appeal to shared values. 
              Keep it concise but persuasive—you&apos;re making the case for why people should sign.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Evidence-based
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Values appeal
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Concise
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Target the Right Audience
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Address your petition to the specific officials or entities with power to act. Include their names 
              and titles. Make clear who you&apos;re holding accountable.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Named recipients
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Decision makers
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear accountability
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Collect Signatures Strategically
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Use both online and physical signatures. Online platforms (Change.org, etc.) reach more people; 
              physical petitions can be delivered ceremonially for media impact. Verify contact information so 
              signers can be mobilized later.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Multi-channel
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Verified contacts
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Build list
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Deliver with Impact
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Don&apos;t just email your petition. Deliver it publicly: at a government meeting, press conference, 
              or official&apos;s office. Invite media. Make the delivery itself a news event that amplifies your message.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Public delivery
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Media coverage
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Ceremonial impact
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Follow Through
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The petition is just the beginning. Use your signer list to organize further action: attend meetings, 
              lobby officials, launch campaigns, or escalate to other tactics if your demands are ignored.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Mobilize signers
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Escalate tactics
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Sustained pressure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Best practices for petition campaigns
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Set ambitious but realistic goals
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Aim high enough to impress officials but low enough to be achievable. Missing your goal undermines credibility.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Update signers regularly
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Keep people engaged with progress reports, next steps, and victories. Turn signers into activists.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Combine with other tactics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Petitions work best as part of a broader strategy: pair them with demonstrations, lobbying, media campaigns, etc.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Validate signatures
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Remove duplicates and invalid entries. Officials will dismiss petitions with fake signatures.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Tell stories
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Include testimonials from people affected by the issue. Personal stories are more compelling than abstract arguments.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Create urgency
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set deadlines for signatures and for officials to respond. Urgency motivates both signers and targets.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section id="limitations" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Understanding petition limitations
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Be realistic about what petitions can achieve:
        </p>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No legal force (usually)
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Except for ballot petitions, most petitions have no legal binding effect. Officials can ignore them. 
              Their power comes from political pressure, not legal obligation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Easy to ignore
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Officials often dismiss petitions, especially online ones that may include signers from outside 
              their jurisdiction. You must make ignoring you politically costly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              &quot;Slacktivism&quot; risk
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Signing a petition feels like action but requires little commitment. Don&apos;t let petitions substitute 
              for more impactful organizing—use them as a starting point.
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
              Do online petitions work?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sometimes. They&apos;re great for building quick awareness and collecting contacts, but they&apos;re often 
              taken less seriously than physical petitions or are only effective when paired with other tactics.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How many signatures do I need?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Depends on context. For local issues, hundreds may matter. For national issues, you might need tens of 
              thousands. Quality matters more than raw numbers—signatures from constituents carry more weight.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What happens after I deliver the petition?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Officials may respond, ignore it, or offer empty promises. The real work begins after delivery: 
              mobilizing signers for follow-up action, media campaigns, and escalating pressure.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Can I get in trouble for petitioning?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No. Petitioning is a fundamental First Amendment right. Officials cannot retaliate against you for 
              exercising this right, though they&apos;re free to disagree with your petition.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Make your voice heard
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Start a petition or sign one. Show officials that citizens are watching and demanding action.
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

