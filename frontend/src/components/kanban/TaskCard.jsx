import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Calendar, Edit2, Trash2, Flag } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Avatar from '../ui/Avatar';
import { tasksAPI } from '../../api';
import toast from 'react-hot-toast';

const priorityConfig = {
  low: { class: 'priority-low', dot: 'bg-emerald-400' },
  medium: { class: 'priority-medium', dot: 'bg-amber-400' },
  high: { class: 'priority-high', dot: 'bg-red-400' },
};

export default function TaskCard({ task, index, onEdit, onDelete }) {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(task._id);
      onDelete(task._id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          onClick={() => onEdit(task)}
        >
          <motion.div
            layout
            className={`group relative p-3.5 rounded-xl bg-navy-700 border cursor-pointer transition-all duration-200
              ${snapshot.isDragging
                ? 'border-blue-500/50 shadow-glow rotate-1 scale-105'
                : 'border-navy-500 hover:border-navy-400'
              }`}
          >
            {/* Priority indicator */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{
              background: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#F59E0B' : '#10B981'
            }} />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2 pl-2">
              <p className="text-sm font-medium text-gray-200 leading-snug line-clamp-2 flex-1">
                {task.title}
              </p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-2.5 pl-2">{task.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pl-2">
              <div className="flex items-center gap-2">
                {/* Priority */}
                <span className={priority.class}>
                  <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                  {task.priority}
                </span>

                {/* Due date */}
                {task.dueDate && (
                  <span className={`flex items-center gap-1 text-xs ${
                    isOverdue ? 'text-red-400' : isDueToday ? 'text-amber-400' : 'text-gray-500'
                  }`}>
                    <Calendar size={10} />
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
              </div>

              {/* Assignee */}
              {task.assignedTo && (
                <Avatar user={task.assignedTo} size="xs" />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
