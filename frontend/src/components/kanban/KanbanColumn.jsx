import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const columnConfig = {
  todo: {
    label: 'To Do',
    accent: 'border-t-gray-500',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dot: 'bg-gray-400',
    btn: 'hover:border-gray-400/50',
  },
  doing: {
    label: 'In Progress',
    accent: 'border-t-blue-500',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
    btn: 'hover:border-blue-400/50',
  },
  done: {
    label: 'Done',
    accent: 'border-t-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
    btn: 'hover:border-emerald-400/50',
  },
};

export default function KanbanColumn({ columnId, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const config = columnConfig[columnId];

  return (
    <div className={`flex flex-col w-72 shrink-0 rounded-2xl bg-navy-800 border border-t-2 border-navy-500 ${config.accent}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="font-semibold text-gray-200 text-sm">{config.label}</span>
          <span className={`badge border ${config.badge} ml-1`}>{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(columnId)}
          className={`p-1.5 rounded-lg text-gray-500 hover:text-gray-300 border border-transparent ${config.btn} transition-all duration-200`}
          title={`Add task to ${config.label}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tasks */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2.5 px-3 pb-3 min-h-[120px] rounded-b-2xl transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-navy-700/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-navy-700 border border-navy-500 flex items-center justify-center mb-2">
                  <Plus size={18} className="text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">Drop tasks here or</p>
                <button
                  onClick={() => onAddTask(columnId)}
                  className="text-xs text-blue-500 hover:text-blue-400 transition-colors mt-1"
                >
                  add a task
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
