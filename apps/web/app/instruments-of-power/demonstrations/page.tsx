import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemonstrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Demonstrations
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Direct, lawful expression of organized disapproval
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            First Amendment protected
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Peaceful assembly
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Visible pressure
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Community solidarity
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
          Demonstrations—including protests, marches, rallies, and vigils—are public displays of collective sentiment. 
          They&apos;re protected by the First Amendment rights to free speech and peaceful assembly.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Effective demonstrations serve multiple purposes: they show officials the depth of public feeling, build 
          solidarity among participants, attract media attention, and demonstrate that you&apos;re organized and 
          committed enough to take public action.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Constitutional right
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Public visibility
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Collective power
          </span>
        </div>
      </section>

      {/* Types */}
      <section id="types" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Types of demonstrations
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Marches and parades
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Move through public streets with signs, chants, and speeches. High visibility, good for media coverage, 
              shows numbers and energy.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Rallies
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Gather in one location for speeches, music, and collective expression. Easier to organize than marches, 
              good for building community.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Pickets
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stand outside a specific location (government building, business, etc.) with signs. Direct pressure 
              on the target, sustained presence.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Vigils
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Quiet, solemn gatherings to honor victims or mark serious issues. Often involving candles or silence. 
              Powerful emotional appeal.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Die-ins and performances
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Theatrical demonstrations where participants simulate death or other dramatic scenes. Creative, 
              memorable, media-friendly.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Flash mobs
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Surprise gatherings that appear suddenly, make a statement, and disperse. Modern, social-media friendly, 
              element of surprise.
            </p>
          </div>
        </div>
      </section>

      {/* Planning */}
      <section id="planning" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Planning an effective demonstration
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Define Clear Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              What do you want to achieve? Raising awareness? Pressuring a specific official? Building your movement? 
              Clear goals shape every other decision about your demonstration.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Specific objectives
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Measurable outcomes
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear message
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Choose the Right Location and Time
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Location matters. Demonstrate where your target will notice: their office, city hall, state capitol. 
              Time matters too: weekday business hours get more official attention; weekends get more participants.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Strategic location
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Optimal timing
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Accessibility
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Obtain Necessary Permits
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Many jurisdictions require permits for marches or large gatherings. Apply early. Permits aren&apos;t 
              required for spontaneous protests or small groups, but they help with logistics and police cooperation.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Check requirements
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Apply early
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Know your rights
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Recruit Participants
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Numbers matter. Use social media, email lists, coalition partners, and word of mouth. Be clear about 
              date, time, location, and expectations. Provide transportation if possible.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Multi-channel outreach
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear details
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Remove barriers
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Organize Logistics
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Appoint marshals to guide the crowd, arrange for first aid, provide water and bathrooms, prepare signs 
              and materials, brief participants on the plan, and designate legal observers in case of arrests.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Safety first
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear coordination
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legal support
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Engage Media
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Send press releases to local media. Invite reporters. Designate media spokespersons. Create visually 
              compelling moments. Your goal is to reach people beyond those physically present.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Press outreach
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Trained spokespeople
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Visual appeal
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Maintain Discipline
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Keep the demonstration peaceful and lawful. Address provocateurs quickly. Stick to your message. 
              Violence or chaos undermines your cause and gives officials excuse to dismiss or suppress you.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Peaceful conduct
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Message discipline
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                De-escalation
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Rights */}
      <section id="legal-rights" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Know your legal rights
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Right to assemble
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You have a constitutional right to peacefully assemble in traditional public forums (sidewalks, parks, 
              public plazas). Governments can impose reasonable time/place/manner restrictions but cannot ban protests.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Right to free speech
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You can express any viewpoint, no matter how unpopular. Police cannot arrest you solely for your message 
              (unless it constitutes true threat or incitement to imminent lawless action).
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Limits on police power
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Police can maintain order but cannot use excessive force or arrest people without cause. Document any 
              police misconduct. Legal observers can witness and record police behavior.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              When arrests may occur
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You can be arrested for blocking traffic (without permit), trespassing on private property, violence or 
              property destruction, refusing to disperse when legally ordered, or violating specific permit conditions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Right to record
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You have the right to photograph and video record police and demonstrations in public spaces. Police 
              cannot confiscate your phone or delete your recordings without a warrant.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Tips */}
      <section id="safety" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Safety and preparation
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Buddy system
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Attend with friends. Keep track of each other. Have a plan if separated.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Emergency contacts
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Write legal support numbers on your arm. Know who to call if arrested.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Protective gear
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comfortable shoes, weather-appropriate clothing, water, snacks, any needed medications.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Know your exits
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Identify escape routes in case the situation turns dangerous or chaotic.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              De-escalation training
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Train marshals in de-escalation techniques to calm tense situations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Medical support
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Have trained first-aiders present with basic medical supplies.
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
              Do I need a permit?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Depends on location, size, and what you&apos;re doing. Small spontaneous protests on sidewalks typically 
              don&apos;t require permits. Large organized marches usually do. Check local rules.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What if counter-protesters show up?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ignore them if possible. Have marshals create space between groups. Do not engage physically or verbally. 
              Focus on your message, not theirs.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How do I handle media interviews?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Designate trained spokespersons. Stay on message. Don&apos;t speculate or argue. Keep answers brief and 
              focused on your key demands.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What if police order us to disperse?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              If it&apos;s a lawful order, comply peacefully. Failing to disperse can lead to arrest. Document the 
              order and challenge it later if you believe it was unlawful.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Stand up and be counted
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Join or organize peaceful demonstrations. Show officials that citizens are paying attention and demanding change.
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

