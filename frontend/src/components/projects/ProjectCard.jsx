import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Tag, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

const statusMap = {
  active: { label: 'Active', variant: 'emerald' },
  completed: { label: 'Completed', variant: 'blue' },
  archived: { label: 'Archived', variant: 'gray' },
};

export default function ProjectCard({ project, index = 0 }) {
  const navigate = useNavigate();
  const { label: statusLabel, variant: statusVariant } = statusMap[project.status] || statusMap.active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/projects/${project._id}`)}
      className="glass-hover rounded-2xl p-5 cursor-pointer group"
    >
      {/* Color accent bar */}
      <div
        className="w-full h-1 rounded-full mb-4 opacity-80"
        style={{ background: `linear-gradient(90deg, ${project.coverColor || '#3B82F6'}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-100 group-hover:text-white text-base leading-snug line-clamp-2 flex-1">
          {project.title}
        </h3>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
        {project.description}
      </p>

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-navy-600 text-gray-400 border border-navy-500">
              <Tag size={10} />
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-navy-600 text-gray-500 border border-navy-500">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-navy-500">
        {/* Members */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map(({ user }) => (
              user && <Avatar key={user._id} user={user} size="xs" className="ring-2 ring-navy-700" />
            ))}
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Users size={12} />
            {project.members?.length || 0}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock size={11} />
            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </span>
          <ArrowRight size={14} className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </motion.div>
  );
}
