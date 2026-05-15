import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function NotesPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/api/notes/text', { title, content });
      navigate(`/study/${res.data.noteId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally { setLoading(false); }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF or PowerPoint file'); return; }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      const res = await API.post('/api/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/study/${res.data.noteId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload PDF');
    } finally { setLoading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.match(/\.(pdf|pptx?)$/i)) setFile(droppedFile);
    else setError('Only PDF and PowerPoint (.pptx) files are accepted');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-surface-100">Add New Note</h1>
        <p className="text-surface-400 mt-2">Paste your notes or upload a PDF to get started.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('text')} className={`tab-btn ${activeTab === 'text' ? 'active' : 'inactive'}`}>
          📝 Paste Text
        </button>
        <button onClick={() => setActiveTab('upload')} className={`tab-btn ${activeTab === 'upload' ? 'active' : 'inactive'}`}>
          📄 Upload Document
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">{error}</div>
      )}

      <div className="glass-card p-6 sm:p-8 animate-slide-up">
        {/* Title field (shared) */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-surface-300 mb-2">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Chapter 5: Data Structures" required />
        </div>

        {activeTab === 'text' ? (
          <form onSubmit={handleTextSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-surface-300 mb-2">Notes Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field min-h-[250px] resize-y" placeholder="Paste your lecture notes, topic content, or any text here..." required />
            </div>
            <button type="submit" disabled={loading || !title || !content} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : '🚀 Save & Generate Study Materials'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFileSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-surface-300 mb-2">Document File (PDF, PPTX)</label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-primary-500 bg-primary-500/5' : 'border-surface-600/50 hover:border-surface-500/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.pptx,.ppt" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                {file ? (
                  <div>
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-surface-200 font-medium">{file.name}</p>
                    <p className="text-surface-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-surface-300">Drop your file here or click to browse</p>
                    <p className="text-surface-500 text-sm mt-1">Max file size: 10MB</p>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" disabled={loading || !title || !file} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : '🚀 Upload & Generate Study Materials'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
