const sizeMap = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl', xl: 'w-20 h-20 text-2xl' };

function getInitials(name = '') {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getColor(name = '') {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
  const i = name.charCodeAt(0) % colors.length;
  return colors[i];
}

export default function Avatar({ user, size = 'md', className = '' }) {
  const s = sizeMap[size] || sizeMap.md;
  const name = user?.name || '';
  const avatar = user?.avatar;

  if (avatar) {
    return (
      <img
        src={avatar.startsWith('http') ? avatar : avatar}
        alt={name}
        className={`${s} rounded-full object-cover flex-shrink-0 ring-2 ring-navy-500 ${className}`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div className={`${s} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
