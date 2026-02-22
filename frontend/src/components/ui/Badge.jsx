const variants = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function Badge({ children, variant = 'blue', className = '' }) {
  return (
    <span className={`badge border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
