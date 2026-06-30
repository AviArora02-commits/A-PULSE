import { motion } from 'motion/react';
import { Activity, ShieldAlert, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onSignIn: () => void;
  onDemoSignIn: () => void;
  isLoggingIn: boolean;
}

export default function Onboarding({ onSignIn, onDemoSignIn, isLoggingIn }: OnboardingProps) {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient soft glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md text-center z-10 flex flex-col items-center"
      >
        {/* Animated App Logo / Icon */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-8 relative"
        >
          <Activity className="w-7 h-7 text-indigo-500" />
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-md animate-pulse" />
        </motion.div>

        {/* Brand Name */}
        <span className="text-sm font-mono tracking-widest text-indigo-400 font-medium uppercase mb-3 block">
          pulse
        </span>

        {/* Tagline / Heading */}
        <h1 className="text-4xl md:text-5xl font-sans font-semibold tracking-tight leading-tight text-[#FAFAFA] mb-4">
          Your day,
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            already prioritized.
          </span>
        </h1>

        <p className="text-[#A1A1AA] text-sm leading-relaxed mb-10 max-w-xs font-sans">
          A real-time AI dashboard unified with your Gmail, Calendar, Classroom, and GitHub.
        </p>

        {/* Action Button Section */}
        <div className="w-full space-y-3 px-6">
          <button
            onClick={onSignIn}
            disabled={isLoggingIn}
            className="w-full bg-[#FAFAFA] hover:bg-[#E4E4E7] active:scale-[0.98] text-[#09090B] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all cursor-pointer duration-200 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <span className="text-sm font-mono">Syncing credentials...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm">Connect with Google</span>
              </>
            )}
          </button>

          <button
            onClick={onDemoSignIn}
            className="w-full bg-[#111113] hover:bg-[#1A1A1F] border border-[#27272A] hover:border-indigo-500/30 text-[#A1A1AA] hover:text-[#FAFAFA] active:scale-[0.98] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer duration-200"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm">Explore Sandbox (Demo Mode)</span>
          </button>
        </div>

        {/* Security / Privacy disclaimer */}
        <div className="mt-12 flex items-center gap-2 text-[11px] font-mono text-[#52525B]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Real-time local sandbox encryption</span>
        </div>
      </motion.div>

      {/* Decorative items around edges */}
      <div className="absolute bottom-8 left-8 text-left hidden sm:block">
        <span className="text-[10px] font-mono text-[#52525B] block">PRODUCT SPEC</span>
        <span className="text-xs font-mono text-[#A1A1AA]">Geist Sans + Mono</span>
      </div>
      <div className="absolute bottom-8 right-8 text-right hidden sm:block">
        <span className="text-[10px] font-mono text-[#52525B] block">MODEL SPEED</span>
        <span className="text-xs font-mono text-[#A78BFA]">Gemini 3.5 Flash</span>
      </div>
    </div>
  );
}
