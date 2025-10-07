import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EconomicVetoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section id="hero" className="mb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Economic Veto
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-6">
          When enough of us stop buying, they have to listen
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Your choice
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Peaceful
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Proven with facts
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Has time limits
          </span>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Built-in safety stops
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
          An Economic Veto is an organized boycott. We pool our buying power to send a message that can&apos;t be ignored.
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          You decide if you want to join. You make your own choices. We show the proof. We say what we want fixed.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Free speech
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            You control it
          </span>
          <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            Numbers you can see
          </span>
        </div>
      </section>

      {/* Stages */}
      <section id="stages" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          How it works: 3 simple steps
        </h2>

        <div className="space-y-8">
          {/* Stage 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              1. We Ask
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              First, we tell the company what they did wrong. We show them the proof. We tell them exactly what needs to change.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              They get time to respond—usually 1 to 2 weeks. An independent group checks all the facts before we do anything.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                They get to answer back
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Facts checked
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Everyone can see the proof
              </span>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              2. We Act
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If they don&apos;t fix it, we stop buying. We start small and build up if we need to.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              First, light pressure. Then we focus on specific products. If that doesn&apos;t work, we go bigger—but only with a strong majority vote.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The system has time limits on everything. If things get too rough on workers or the economy, it automatically pauses.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Start small
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Help for workers affected
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Auto-stops if needed
              </span>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              3. We Finish
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              When the company agrees to fix the problem, we watch to make sure they actually do it. Progress is tracked where everyone can see it.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Then we announce &ldquo;Return Week.&rdquo; Everyone goes back to shopping normally. Workers and suppliers get thanked. Everything gets saved as a record.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                We check their work
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Clear ending
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                Saved for the record
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Your Role */}
      <section id="your-role" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          What you do: Pick one
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Open the app. Look at what&apos;s happening. Pick one button:
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Buy as usual
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Use this during the &ldquo;We Ask&rdquo; step, or when we&apos;re done and it&apos;s Return Week.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Don&apos;t buy
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Use this during the &ldquo;We Act&rdquo; step. We count your choice (with your OK) but only as a total number. Nobody sees your personal info.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
            You&apos;re in charge
          </span>
          <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
            Change your mind anytime
          </span>
          <span className="px-4 py-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
            We never buy or cancel for you
          </span>
        </div>
      </section>

      {/* Guardrails */}
      <section id="guardrails" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          How we stay safe
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Time limits
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Everything has a time limit. We can&apos;t keep going forever. This stops things from getting out of hand.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Emergency stops
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              If workers are getting hurt badly or the economy starts crashing, the system hits pause automatically.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Outside checkers
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              An independent group checks the facts and decides if we can move forward. They don&apos;t work for us.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No bullying
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No threats. No attacking people personally. No harassment. Just free speech and personal choices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Your privacy
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We collect as little as possible. We only show total numbers, never your name. Everything is tracked so nobody can cheat.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Clear way out
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We tell them exactly what fixes things. When they do it, Return Week starts and everything goes back to normal.
            </p>
          </div>
        </div>
      </section>

      {/* Impact and Reconciliation */}
      <section id="impact-reconciliation" className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          How we measure results
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          We track how it&apos;s working with public numbers and independent checks. When the numbers show real change, 
          we start wrapping things up and people go back to normal shopping.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            We count it
          </span>
          <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            It matches the problem
          </span>
          <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            We fix the damage
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
              Is this legal?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Yes. Boycotts are protected under free speech when they&apos;re voluntary and peaceful. 
              We help people organize and share information. You make your own buying choices.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Will you buy or cancel stuff for me?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No. Never. We will never touch your money or make purchases on your behalf. You do everything yourself.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What about workers and small suppliers?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              We have time limits, emergency stops, and a fund to help workers who get hurt. 
              Return Week brings everything back to normal once the problem is fixed.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              How does it end?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              When the company fixes what we asked for and we can verify it, we announce Return Week. 
              Everyone goes back to shopping normally. We save all the records.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What info do you collect about me?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              As little as possible. Just enough to count how many people are participating. 
              We only share total numbers, never your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="mb-16 text-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to join?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Add your voice. Follow the rules. Help make real change happen.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/join">Join Whitepine</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/torchwood">See What&apos;s Happening</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

