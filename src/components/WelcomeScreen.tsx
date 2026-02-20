import { Shield, Lock, Clock, CheckCircle, ArrowRight, Eye } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center mx-auto w-full max-w-xl px-6 py-12">
        
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-400 mb-6 shadow-lg shadow-emerald-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Cyber Fitness Advisor
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-md mx-auto">
            A quick, personal checkup for your digital security — with steps you can actually take today.
          </p>
        </div>

        {/* What to expect */}
        <div className="space-y-4 mb-10">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Go at your own pace</p>
              <p className="text-sm text-slate-400">One card at a time, tailored to your devices and habits — stop and resume anytime</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Personalized results</p>
              <p className="text-sm text-slate-400">A security score plus actionable recommendations matched to your setup</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <Eye className="w-5 h-5 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">We ask about your devices & habits</p>
              <p className="text-sm text-slate-400">So recommendations match your actual setup — not generic advice</p>
            </div>
          </div>
        </div>

        {/* Privacy callout */}
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 mb-10">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300 mb-1">100% Private — No Data Leaves Your Device</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                There is no server. Every answer stays in your browser's local storage. 
                Nothing is uploaded, tracked, or shared — ever. You can verify by checking DevTools → Network, or simply go offline; the app still works.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Start My Checkup
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          No account needed. Resume anytime — your progress saves automatically.
        </p>
      </div>
    </div>
  );
}
