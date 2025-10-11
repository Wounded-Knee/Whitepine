import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StrikesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Strikes
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Withhold labor to force accountability
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Worker power
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Economic pressure
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Collective action
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Protected right
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
          A strike is the collective refusal to work until specific demands are met. It&apos;s one of the most 
          powerful tools available to workers, disrupting operations and cutting profits until employers (or governments) 
          negotiate in good faith.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          While traditionally associated with labor disputes, strikes can also be used for political goals: protesting 
          government policies, demanding social change, or resisting authoritarian actions. The general strike—where 
          workers across industries walk out simultaneously—is the ultimate expression of popular power.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Labor rights
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Economic leverage
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Political tool
          </span>
        </div>
      </section>

      {/* Types */}
      <section id="types" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Types of strikes
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Economic Strike
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Workers strike to improve wages, benefits, or working conditions. This is the classic labor strike, 
              protected by federal law when properly conducted. Employers cannot fire strikers but can hire permanent 
              replacements.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Workplace issues
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legal protection
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Contract negotiation
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Unfair Labor Practice Strike
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Workers strike to protest illegal employer actions (union busting, retaliation, refusing to bargain, etc.). 
              Stronger protections than economic strikes: strikers cannot be permanently replaced and have stronger 
              reinstatement rights.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Legal violations
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Strong protections
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Cannot be replaced
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Wildcat Strike
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Spontaneous strike without union authorization. Often in response to immediate dangerous conditions 
              or provocations. Legally risky but can be effective when workers feel they have no other option.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Spontaneous
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                No union approval
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Higher risk
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Sympathy Strike
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Workers strike in support of other workers&apos; strikes, even if their own employer has done nothing wrong. 
              Shows solidarity across workplaces. Legal protections vary; often prohibited by collective bargaining 
              agreements.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Solidarity action
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Cross-workplace
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Limited protection
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              General Strike
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Mass strike across multiple industries and workplaces, often for political rather than economic demands. 
              Can paralyze entire cities or regions. The ultimate show of popular power. Rare in the U.S. but common 
              elsewhere.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Multi-industry
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Political goals
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Maximum pressure
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Partial/Rolling Strikes
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Strategic strikes where only some workers walk out, or workers strike in shifts or at specific times. 
              Maintains some operations while demonstrating power. Less costly to workers while still creating disruption.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Strategic timing
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Lower cost
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Sustained pressure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Framework */}
      <section id="legal" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Legal rights and restrictions
        </h2>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              National Labor Relations Act (NLRA)
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Federal law protects private sector workers&apos; right to strike for better working conditions or to protest 
              unfair labor practices. Protection includes freedom from retaliation, though employers can hire replacements 
              during economic strikes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Public sector limitations
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Many states prohibit public employee strikes, especially for &quot;essential&quot; workers (police, firefighters, 
              sometimes teachers). Penalties can include firing and even jail. Check state law carefully.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No-strike clauses
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Many union contracts include no-strike clauses prohibiting strikes during the contract term (except for 
              unfair labor practices or safety issues). Violating these can void contract protections.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Peaceful conduct required
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Strikers must conduct themselves lawfully: no violence, no property destruction, no blocking access beyond 
              legal picketing. Unlawful conduct can result in termination and criminal charges.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              At-will employment caveat
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Non-union workers have weaker protections. While the NLRA technically protects &quot;concerted activity,&quot; 
              at-will employees can often be fired for striking, especially if not part of an organized union campaign.
            </p>
          </div>
        </div>
      </section>

      {/* How to Strike */}
      <section id="how-to-strike" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Organizing an effective strike
        </h2>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. Build Solidarity First
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Before striking, ensure overwhelming worker support. Poll your coworkers. Address concerns. Build trust. 
              A weak strike where only some workers participate will fail and make future organizing harder.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Majority support
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Trust building
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Clear communication
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. Define Clear Demands
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              What exactly do you want? Be specific and realistic. Vague or impossible demands give employers excuse 
              to refuse negotiation. Know your bottom line and your ideal outcome.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Concrete goals
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Achievable demands
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Negotiation strategy
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. Prepare Financially
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Workers won&apos;t get paid during a strike. Build a strike fund in advance. Arrange hardship assistance. 
              The side that can hold out longer usually wins—make sure it&apos;s you.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Strike fund
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Hardship support
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Sustainability
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              4. Provide Legal Notice (If Required)
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Some contracts or laws require advance notice before striking. Healthcare workers, for example, must 
              usually give 10 days notice. Consult a labor lawyer to ensure you&apos;re protected.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Legal compliance
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Required notices
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Legal counsel
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              5. Organize Picket Lines
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Establish picket lines outside the workplace. This demonstrates unity, discourages strikebreakers, 
              and communicates your message to the public. Follow all laws regarding picketing and access.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Visible presence
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Lawful picketing
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Public engagement
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              6. Build Public Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Engage media, rally community support, explain your cause. Public pressure on the employer can be as 
              important as the economic pressure of the strike itself.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Media strategy
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Community support
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Public pressure
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              7. Negotiate Resolution
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The goal is to win your demands, not to strike forever. Be ready to negotiate when the employer is 
              willing. Know when to compromise and when to hold firm. Get agreements in writing.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Good faith bargaining
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Strategic compromise
              </span>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
                Written agreements
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Risks */}
      <section id="risks" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Understanding the risks
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Strikes are powerful but risky. Consider these factors:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Loss of income
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Workers don&apos;t get paid during strikes. The longer it lasts, the greater the financial hardship. 
              Ensure workers can sustain the strike.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Potential job loss
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              In economic strikes, employers can hire permanent replacements. Even protected strikers may find 
              themselves without jobs when it&apos;s over.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Employer retaliation
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              While illegal, employers may retaliate subtly: worse shifts, denied promotions, hostile environment. 
              Document everything and be prepared to fight.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Public backlash
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              If your strike causes significant disruption (transit, healthcare, schools), public opinion may turn 
              against you. Strong communication is essential.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Internal division
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Strikes can divide workers between strikers and those who cross picket lines. Relationships may be 
              permanently damaged.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Business closure
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              In extreme cases, prolonged strikes can drive employers out of business, costing everyone their jobs. 
              Assess whether the employer can actually afford your demands.
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
              Do I need a union to strike?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No, but unions provide organization, legal protection, strike funds, and experience. Non-union strikes 
              are riskier but still protected under the NLRA for &quot;concerted activity.&quot;
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Can I be fired for striking?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Depends. In protected strikes, you cannot be fired, but you can be permanently replaced during economic 
              strikes. Unfair labor practice strikers have stronger protections. Illegal or violent conduct removes protections.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What if I need the income?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Striking requires sacrifice. Unions typically provide strike pay (though less than regular wages). 
              Build savings or a strike fund in advance. Consider partial strikes to reduce income loss.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Are general strikes legal?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              General strikes are legal but complicated. Individual workers can strike for their own workplace issues. 
              Coordinated multi-workplace political strikes occupy legal gray area and face strong resistance.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Stand together, withhold labor
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          When workers unite and refuse to work until demands are met, they exercise their greatest power.
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

