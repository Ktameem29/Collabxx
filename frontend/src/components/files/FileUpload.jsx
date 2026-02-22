import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';
import { filesAPI } from '../../api';
import toast from 'react-hot-toast';

const formatBytes = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

export default function FileUpload({ project, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const addFiles = (newFiles) => {
    const list = Array.from(newFiles).map((f) => ({
      file: f, id: Math.random().toString(36).slice(2),
      status: 'pending', progress: 0,
    }));
    setFiles((p) => [...p, ...list]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const removeFile = (id) => setFiles((p) => p.filter((f) => f.id !== id));

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending');
    if (!pending.length) return toast('No files to upload');
    setUploading(true);

    for (const item of pending) {
      setFiles((p) => p.map((f) => f.id === item.id ? { ...f, status: 'uploading' } : f));
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        const { data } = await filesAPI.upload(project._id, formData);
        setFiles((p) => p.map((f) => f.id === item.id ? { ...f, status: 'done' } : f));
        onUploaded(data);
      } catch {
        setFiles((p) => p.map((f) => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    }

    setUploading(false);
    toast.success('Upload complete!');
    setTimeout(() => setFiles((p) => p.filter((f) => f.status !== 'done')), 2000);
  };

  const statusIcon = (status) => {
    if (status === 'uploading') return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
    if (status === 'done') return <CheckCircle size={16} className="text-emerald-400" />;
    if (status === 'error') return <AlertCircle size={16} className="text-red-400" />;
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
          ${dragging
            ? 'border-blue-500 bg-blue-500/5 shadow-glow'
            : 'border-navy-500 hover:border-blue-500/50 hover:bg-navy-700/50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <motion.div
          animate={{ scale: dragging ? 1.05 : 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-blue-500/20' : 'bg-navy-700'}`}>
            <UploadCloud size={28} className={dragging ? 'text-blue-400' : 'text-gray-500'} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">
              {dragging ? 'Drop files here' : 'Drag & drop files, or click to browse'}
            </p>
            <p className="text-xs text-gray-600 mt-1">Images, PDFs, docs, videos — up to 50MB each</p>
          </div>
        </motion.div>
      </div>

      {/* File queue */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-navy-700 border border-navy-500"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(item.file.size)}</p>
                  {item.status === 'uploading' && (
                    <div className="w-full h-1 bg-navy-600 rounded-full mt-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2 }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(item.status)}
                  {item.status === 'pending' && (
                    <button onClick={() => removeFile(item.id)} className="p-1 text-gray-500 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            <button
              onClick={uploadAll}
              disabled={uploading || files.every((f) => f.status !== 'pending')}
              className="btn-primary w-full"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : `Upload ${files.filter((f) => f.status === 'pending').length} file(s)`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
