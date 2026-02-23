import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BadgeGrid({ definitions = [], earnedBadges = [] }) {
  const earnedMap = new Map(earnedBadges.map((b) => [b.id, b.earnedAt]));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {definitions.map((def, i) => {
        const earned = earnedMap.has(def.id);
        const earnedAt = earnedMap.get(def.id);
        return (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-200 ${
              earned
                ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_16px_rgba(59,130,246,0.15)]'
                : 'bg-navy-800 border-navy-600 opacity-50'
            }`}
          >
            {/* Lock overlay for unearned */}
            {!earned && (
              <div className="absolute top-2 right-2">
                <Lock size={12} className="text-gray-600" />
              </div>
            )}

            {/* Icon */}
            <span
              className={`text-3xl mb-2 leading-none ${earned ? '' : 'grayscale opacity-40'}`}
              role="img"
              aria-label={def.name}
            >
              {def.icon}
            </span>

            {/* Name */}
            <p className={`text-xs font-semibold leading-tight mb-1 ${earned ? 'text-gray-100' : 'text-gray-500'}`}>
              {def.name}
            </p>

            {/* Description */}
            <p className={`text-[11px] leading-tight ${earned ? 'text-gray-400' : 'text-gray-600'}`}>
              {def.description}
            </p>

            {/* Earned date */}
            {earned && earnedAt && (
              <p className="text-[10px] text-blue-400 mt-2">
                {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
