import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { tasksAPI } from '../../api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, isPast, parseISO } from 'date-fns';

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

export default function ProjectCalendar({ project }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksAPI.getByProject(project._id)
      .then(({ data }) => setTasks(data.filter((t) => t.dueDate)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [project._id]);

  const getTasksForDay = (day) =>
    tasks.filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), day));

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) { days.push(day); day = addDays(day, 1); }

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Calendar size={18} className="text-blue-400" />
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => { setCurrentMonth(subMonths(currentMonth, 1)); setSelectedDay(null); }}
            className="p-2 rounded-xl bg-navy-700 border border-navy-500 text-gray-400 hover:text-gray-200 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => { setCurrentMonth(new Date()); setSelectedDay(null); }}
            className="px-3 py-1.5 rounded-xl bg-navy-700 border border-navy-500 text-xs text-gray-400 hover:text-gray-200 transition-colors">
            Today
          </button>
          <button onClick={() => { setCurrentMonth(addMonths(currentMonth, 1)); setSelectedDay(null); }}
            className="p-2 rounded-xl bg-navy-700 border border-navy-500 text-gray-400 hover:text-gray-200 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <AlertCircle size={15} />
          No tasks with due dates yet. Add due dates in the Kanban board.
        </div>
      )}

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDay = isToday(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const hasOverdue = dayTasks.some((t) => t.status !== 'done' && isPast(parseISO(t.dueDate)) && !isToday(day));

          return (
            <motion.button
              key={i}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center min-h-[72px] p-1.5 rounded-xl border transition-all duration-150 ${
                !isCurrentMonth ? 'opacity-30 cursor-default' :
                isSelected ? 'bg-blue-500/20 border-blue-500/50' :
                isTodayDay ? 'bg-blue-500/10 border-blue-500/30' :
                'bg-navy-800 border-navy-600 hover:border-navy-400'
              }`}
            >
              {/* Day number */}
              <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                isTodayDay ? 'bg-blue-500 text-white' :
                isCurrentMonth ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {format(day, 'd')}
              </span>

              {/* Task dots */}
              <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                {dayTasks.slice(0, 3).map((t) => (
                  <span key={t._id} className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLORS[t.priority] || 'bg-gray-400'} ${t.status === 'done' ? 'opacity-40' : ''}`} />
                ))}
                {dayTasks.length > 3 && <span className="text-[9px] text-gray-500">+{dayTasks.length - 3}</span>}
              </div>

              {/* Overdue indicator */}
              {hasOverdue && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
            </motion.button>
          );
        })}
      </div>

      {/* Selected day task list */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-3"
        >
          <h3 className="font-semibold text-gray-200 text-sm flex items-center justify-between">
            {format(selectedDay, 'EEEE, MMMM d')}
            <span className="text-xs text-gray-500 font-normal">{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</span>
          </h3>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No tasks due on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map((t) => {
                const overdue = t.status !== 'done' && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate));
                return (
                  <div key={t._id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                    t.status === 'done' ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' :
                    overdue ? 'bg-red-500/5 border-red-500/20' :
                    'bg-navy-800 border-navy-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLORS[t.priority]}`} />
                    <p className={`text-sm flex-1 ${t.status === 'done' ? 'line-through text-gray-500' : 'text-gray-200'}`}>{t.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
                      t.status === 'doing' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-navy-600 text-gray-400'
                    }`}>{t.status === 'todo' ? 'To Do' : t.status === 'doing' ? 'In Progress' : 'Done'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
