import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image, File, Music, Video, Archive, Download, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { filesAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function getFileIcon(mimeType = '') {
  if (mimeType.startsWith('image/')) return { Icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10' };
  if (mimeType.startsWith('video/')) return { Icon: Video, color: 'text-purple-400', bg: 'bg-purple-500/10' };
  if (mimeType.startsWith('audio/')) return { Icon: Music, color: 'text-amber-400', bg: 'bg-amber-500/10' };
  if (mimeType.includes('pdf') || mimeType.includes('doc') || mimeType.includes('text')) {
    return { Icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  }
  if (mimeType.includes('zip') || mimeType.includes('rar')) {
    return { Icon: Archive, color: 'text-orange-400', bg: 'bg-orange-500/10' };
  }
  return { Icon: File, color: 'text-gray-400', bg: 'bg-gray-500/10' };
}

export default function FileList({ project, refresh }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwner = project?.owner?._id === user?._id;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await filesAPI.getByProject(project._id);
      setFiles(data);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [project._id, refresh]); // eslint-disable-line

  const handleDelete = async (fileId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this file?')) return;
    try {
      await filesAPI.delete(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (files.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-navy-700 border border-navy-500 flex items-center justify-center mb-4">
        <File size={28} className="text-gray-600" />
      </div>
      <p className="text-gray-400 font-medium">No files yet</p>
      <p className="text-sm text-gray-600 mt-1">Upload files to share with your team</p>
    </div>
  );

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {files.map((file, i) => {
          const { Icon, color, bg } = getFileIcon(file.mimeType);
          const canDelete = isOwner || file.uploadedBy?._id === user?._id;

          return (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-navy-700 border border-navy-500 hover:border-navy-400 group transition-colors"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{file.originalName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                  <span className="text-xs text-gray-600">•</span>
                  <div className="flex items-center gap-1">
                    <Avatar user={file.uploadedBy} size="xs" />
                    <span className="text-xs text-gray-500">{file.uploadedBy?.name}</span>
                  </div>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  title="Open file"
                >
                  <ExternalLink size={15} />
                </a>
                <a
                  href={file.url}
                  download={file.originalName}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Download"
                >
                  <Download size={15} />
                </a>
                {canDelete && (
                  <button
                    onClick={(e) => handleDelete(file._id, e)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
