import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RecallElectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Recall Elections
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Remove officials mid-term when they betray the public trust
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Direct accountability
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Immediate action
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            State/local tool
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Democratic power
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
          A recall election allows voters to remove an elected official from office before their term ends. 
          It&apos;s a direct form of accountability when an official has violated the public trust through corruption, 
          incompetence, or betrayal of campaign promises.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Not all states allow recalls, and the specific rules vary widely. Where available, recalls provide a powerful 
          tool to remove bad actors without waiting for the next election cycle.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Voter empowerment
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Swift accountability
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Popular sovereignty
          </span>
        </div>
      </section>

      {/* Availability */}
      <section id="availability" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Where recalls are available
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          19 states allow recall elections for state officials, and many more allow recalls at the local level 
          (mayors, city council, school boards, etc.). Check your state and local laws to see what&apos;s possible.
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            States with recall provisions (for state officials)
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="text-gray-600 dark:text-gray-300">Alaska</div>
            <div className="text-gray-600 dark:text-gray-300">Arizona</div>
            <div className="text-gray-600 dark:text-gray-300">California</div>
            <div className="text-gray-600 dark:text-gray-300">Colorado</div>
            <div className="text-gray-600 dark:text-gray-300">Georgia</div>
            <div className="text-gray-600 dark:text-gray-300">Idaho</div>
            <div className="text-gray-600 dark:text-gray-300">Illinois</div>
            <div className="text-gray-600 dark:text-gray-300">Kansas</div>
            <div className="text-gray-600 dark:text-gray-300">Louisiana</div>
            <div className="text-gray-600 dark:text-gray-300">Michigan</div>
            <div className="text-gray-600 dark:text-gray-300">Minnesota</div>
            <div className="text-gray-600 dark:text-gray-300">Montana</div>
            <div className="text-gray-600 dark:text-gray-300">Nevada</div>
            <div className="text-gray-600 dark:text-gray-300">New Jersey</div>
            <div className="text-gray-600 dark:text-gray-300">North Dakota</div>
            <div className="text-gray-600 dark:text-gray-300">Oregon</div>
            <div className="text-gray-600 dark:text-gray-300">Rhode Island</div>
            <div className="text-gray-600 dark:text-gray-300">Washington</div>
            <div className="text-gray-600 dark:text-gray-300">Wisconsin</div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Note: Federal officials (President, Congress) cannot be recalled under current law. Many localities allow 
            recalls even in states without state-level provisions.
          </p>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          How the recall process works
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Review Legal Requirements
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Each jurisdiction has specific rules: grounds for recall (some require specific causes, others allow 
              any reason), signature thresholds (typically 15-40% of voters), and timing restrictions (some states 
              prohibit recalls during the first or last portion of a term).
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Know the rules
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Signature requirements
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Timing windows
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. File Notice of Intent
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Most jurisdictions require filing official paperwork before collecting signatures. This often includes 
              a statement of reasons for the recall. The official may have an opportunity to respond.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Official paperwork
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Statement of cause
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legal compliance
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Gather Signatures
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Organize volunteers to collect petition signatures within the time limit (typically 60-180 days). 
              Gather significantly more than required to account for invalid signatures. Follow all legal requirements 
              for petition format and circulator registration.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Volunteer army
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Exceed minimums
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Quality control
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Verification and Certification
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Election officials verify that signatures are from registered voters in the jurisdiction. This process 
              can take weeks. If enough valid signatures are certified, the recall election is scheduled.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Official review
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Signature validation
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Election scheduled
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Campaign and Vote
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Run a full campaign for the recall election. Some jurisdictions have a simple yes/no vote; others 
              simultaneously elect a replacement. Voters decide whether to remove the official and who should replace them.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Full campaign
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear messaging
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Get out the vote
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* When to Use */}
      <section id="when-to-use" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          When recalls are appropriate
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-green-500">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              ✓ Appropriate uses
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Corruption or criminal conduct</li>
              <li>• Gross incompetence or negligence</li>
              <li>• Betrayal of clear campaign promises</li>
              <li>• Ethics violations</li>
              <li>• Abuse of power</li>
              <li>• Refusal to fulfill duties</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-red-500">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              ✗ Inappropriate uses
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>• Simple policy disagreements</li>
              <li>• Partisan revenge</li>
              <li>• Personal dislike</li>
              <li>• Single controversial but legal vote</li>
              <li>• Normal political debate</li>
              <li>• Issues better addressed at ballot box</li>
            </ul>
          </div>
        </div>

        <p className="text-lg text-gray-600 dark:text-gray-300 mt-6">
          Recalls are extraordinary measures that should be reserved for serious breaches of trust. Overuse 
          can undermine democratic stability and create perpetual campaigning.
        </p>
      </section>

      {/* Challenges */}
      <section id="challenges" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Challenges in recall campaigns
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              High signature thresholds
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Many states require signatures from 25% or more of voters. This demands massive volunteer efforts 
              and tight organization.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Incumbent advantages
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Officials facing recall still hold office and can use their platform, resources, and connections 
              to fight back.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Voter fatigue
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Recall elections add to the already crowded election calendar. Motivating voters to participate 
              can be challenging.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Legal challenges
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Officials often challenge recalls in court, questioning signature validity, petition format, or 
              stated grounds. Be prepared for litigation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Cost and time
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Recall campaigns require significant resources and months of sustained effort with uncertain outcomes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Partisan polarization
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Recalls can become proxy battles between parties rather than accountability mechanisms. Need clear, 
              nonpartisan cause.
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
              Can we recall federal officials?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No. The U.S. Constitution does not provide for recall of federal officials. Congress members can only 
              be removed by expulsion (vote of their own chamber), and the President only through impeachment.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How often do recalls succeed?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Most recall attempts fail to gather enough signatures. Of those that make it to a vote, about 60% 
              succeed at the local level, but success rates are lower for state officials.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What if we don&apos;t have recall provisions?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Focus on other tools: primary challenges, general election opposition, petitions for resignation, 
              public pressure campaigns, and advocacy for recall legislation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How do we prevent recall abuse?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              High signature thresholds, time restrictions, and clear standards help prevent frivolous recalls. 
              Reserve recalls for serious misconduct, not policy disputes.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Know your recall rights
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Research your state and local recall provisions. When officials betray the public trust, act.
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

