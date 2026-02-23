import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Mail, ArrowLeft } from 'lucide-react';

const STEPS = [
  'Admin reviews pending applications',
  'Students ranked by merit score',
  'Approved students can log in',
];

export default function Waitlisted() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Clock size={36} className="text-amber-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-100 mb-3 text-center">You're on the waitlist</h1>
        <p className="text-gray-400 mb-6 leading-relaxed text-center text-sm">
          Your university's student slots are currently full. An admin will review your application
          and activate your account when a spot opens.
        </p>

        {/* Steps */}
        <div className="card mb-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">What happens next?</h3>
          <ol className="space-y-2.5">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Notice */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300 mb-6">
          <Mail size={16} className="shrink-0" />
          <span>You can try logging in after your account has been approved.</span>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
