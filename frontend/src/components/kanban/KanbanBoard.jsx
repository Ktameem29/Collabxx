import { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import { tasksAPI } from '../../api';
import toast from 'react-hot-toast';

const COLUMNS = ['todo', 'doing', 'done'];

export default function KanbanBoard({ project }) {
  const [tasks, setTasks] = useState({ todo: [], doing: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [addStatus, setAddStatus] = useState('todo');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await tasksAPI.getByProject(project._id);
      const grouped = { todo: [], doing: [], done: [] };
      data.forEach((t) => { if (grouped[t.status]) grouped[t.status].push(t); });
      // Sort by order
      COLUMNS.forEach((col) => grouped[col].sort((a, b) => a.order - b.order));
      setTasks(grouped);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [project._id]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;

    const newTasks = { ...tasks };
    const srcList = [...newTasks[srcCol]];
    const [moved] = srcList.splice(source.index, 1);
    newTasks[srcCol] = srcList;

    const dstList = srcCol === dstCol ? srcList : [...newTasks[dstCol]];
    moved.status = dstCol;
    dstList.splice(destination.index, 0, moved);
    newTasks[dstCol] = dstList;

    setTasks(newTasks);

    // Persist to backend
    try {
      const updates = [];
      COLUMNS.forEach((col) => {
        newTasks[col].forEach((task, idx) => {
          updates.push({ id: task._id, status: col, order: idx });
        });
      });
      await tasksAPI.reorder(updates);
    } catch {
      toast.error('Failed to save order');
      fetchTasks(); // Revert
    }
  };

  const openAddModal = (status) => {
    setEditTask(null);
    setAddStatus(status);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleSaved = (savedTask, action) => {
    setTasks((prev) => {
      const newTasks = {
        todo: [...prev.todo],
        doing: [...prev.doing],
        done: [...prev.done],
      };

      if (action === 'create') {
        newTasks[savedTask.status].push(savedTask);
      } else {
        // Remove from old location
        COLUMNS.forEach((col) => {
          newTasks[col] = newTasks[col].filter((t) => t._id !== savedTask._id);
        });
        // Add to new location
        newTasks[savedTask.status].push(savedTask);
      }

      return newTasks;
    });
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      COLUMNS.forEach((col) => {
        newTasks[col] = newTasks[col].filter((t) => t._id !== taskId);
      });
      return newTasks;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalTasks = COLUMNS.reduce((acc, col) => acc + tasks[col].length, 0);
  const doneTasks = tasks.done.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Progress bar */}
      <div className="mb-6 p-4 rounded-2xl bg-navy-700 border border-navy-500">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <span className="text-sm font-medium text-gray-200">Overall Progress</span>
            <span className="ml-3 text-xs text-gray-500">{doneTasks}/{totalTasks} tasks completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200">{progress}%</span>
            <button onClick={fetchTasks} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-navy-600 transition-colors">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
        <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col}
              columnId={col}
              tasks={tasks[col]}
              onAddTask={openAddModal}
              onEditTask={openEditModal}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        task={editTask}
        project={project}
        onSaved={handleSaved}
        initialStatus={addStatus}
      />
    </motion.div>
  );
}
