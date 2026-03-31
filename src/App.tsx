import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  LayoutDashboard, 
  Globe, 
  X,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

type AppLink = {
  id: string;
  title: string;
  url: string;
};

const DEFAULT_LINKS: AppLink[] = [
  { id: '1', title: 'Program Prioritas', url: 'https://s.id/cnQAK' },
  { id: '2', title: 'Lomba Vlog 7KAIH', url: 'https://sites.google.com/guru.smp.belajar.id/beranda7kihspanju/implementasi-kegiatan-7kaih/lomba-vlog-7kaih' },
  { id: '3', title: 'Home 7KAIH Spanju', url: 'https://sites.google.com/guru.smp.belajar.id/7kaihspanju/home' },
];

export default function App() {
  const [links, setLinks] = useState<AppLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<AppLink | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_links_v3');
    if (saved) {
      try {
        setLinks(JSON.parse(saved));
      } catch (e) {
        setLinks(DEFAULT_LINKS);
      }
    } else {
      setLinks(DEFAULT_LINKS);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('dashboard_links_v3', JSON.stringify(links));
  }, [links]);

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink: AppLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url: formattedUrl,
    };

    setLinks([...links, newLink]);
    setNewTitle('');
    setNewUrl('');
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLinks(links.filter(link => link.id !== id));
    if (selectedLink?.id === id) {
      setSelectedLink(null);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(links));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "dashboard_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedLinks = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedLinks)) {
          setLinks(importedLinks);
        } else {
          alert('Format file tidak valid.');
        }
      } catch (error) {
        alert('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* LEFT SIDEBAR */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative z-10 w-80 flex flex-col bg-slate-800/40 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.4)]">
            <LayoutDashboard size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
            3D Dashboard
          </h1>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {links.map((link) => {
              const isSelected = selectedLink?.id === link.id;
              return (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setSelectedLink(link)}
                    className={`group relative w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300
                      ${isSelected 
                        ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0_6px_0_#312e81,0_10px_20px_rgba(79,70,229,0.4)] translate-y-[-2px]' 
                        : 'bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_6px_0_#1e293b,0_8px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_0_#1e293b,0_12px_20px_rgba(0,0,0,0.3)] hover:translate-y-[-2px]'
                      }
                      active:shadow-[0_0px_0_#1e293b] active:translate-y-[4px]
                    `}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Globe size={18} className={isSelected ? 'text-indigo-100' : 'text-slate-400'} />
                      <span className={`font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {link.title}
                      </span>
                    </div>
                    
                    <div 
                      onClick={(e) => handleDelete(e, link.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected 
                          ? 'hover:bg-indigo-400/50 text-indigo-200 hover:text-white' 
                          : 'opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400'
                      }`}
                    >
                      <Trash2 size={16} />
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {links.length === 0 && (
            <div className="text-center p-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
              Belum ada aplikasi. Tambahkan sekarang!
            </div>
          )}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 space-y-3 bg-slate-800/30">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_4px_0_#065f46,0_5px_15px_rgba(16,185,129,0.3)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#065f46,0_8px_20px_rgba(16,185,129,0.4)] active:shadow-[0_0px_0_#065f46] active:translate-y-[4px] transition-all text-white font-semibold"
          >
            <Plus size={20} />
            Tambah Aplikasi
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-b from-slate-600 to-slate-700 shadow-[0_4px_0_#334155,0_5px_15px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#334155,0_8px_20px_rgba(0,0,0,0.3)] active:shadow-[0_0px_0_#334155] active:translate-y-[4px] transition-all text-slate-200 text-sm font-medium"
            >
              <Download size={16} />
              Backup
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-b from-slate-600 to-slate-700 shadow-[0_4px_0_#334155,0_5px_15px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#334155,0_8px_20px_rgba(0,0,0,0.3)] active:shadow-[0_0px_0_#334155] active:translate-y-[4px] transition-all text-slate-200 text-sm font-medium"
            >
              <Upload size={16} />
              Upload
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
              className="hidden" 
            />
          </div>
        </div>
      </motion.div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 p-6 relative z-10 flex flex-col">
        <div className="flex-1 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl shadow-[inset_0_2px_20px_rgba(0,0,0,0.2),0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden relative flex flex-col">
          
          {/* Top Bar of the Iframe Container */}
          <div className="h-12 bg-slate-900/80 border-b border-slate-700/50 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]"></div>
            </div>
            <div className="flex-1 flex justify-center">
              {selectedLink && (
                <div className="bg-slate-800 px-4 py-1 rounded-full text-xs text-slate-400 border border-slate-700/50 flex items-center gap-2 shadow-inner">
                  <Globe size={12} />
                  <span className="truncate max-w-[300px]">{selectedLink.url}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {selectedLink && (
                <a 
                  href={selectedLink.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                  title="Buka di tab baru (jika diblokir)"
                >
                  <ExternalLink size={14} />
                  Buka di Tab Baru
                </a>
              )}
            </div>
          </div>

          {/* Iframe or Empty State */}
          <div className="flex-1 relative bg-white">
            <AnimatePresence mode="wait">
              {selectedLink ? (
                <motion.iframe
                  key={selectedLink.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={selectedLink.url}
                  className="w-full h-full border-none"
                  title={selectedLink.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-8 text-center"
                >
                  <div className="w-32 h-32 mb-6 relative">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <LayoutDashboard size={128} className="text-slate-700 relative z-10 drop-shadow-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">Pilih Aplikasi</h2>
                  <p className="max-w-md text-slate-500">
                    Pilih aplikasi dari menu di sebelah kiri untuk membukanya di sini. 
                    Anda juga dapat menambahkan link aplikasi baru.
                  </p>
                  
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-start gap-3 max-w-md text-left">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Catatan:</strong> Beberapa situs web (seperti Google atau GitHub) memblokir penampilan halamannya di dalam aplikasi lain (iframe). Gunakan link yang mendukung embedding.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ADD LINK MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                <h2 className="text-xl font-bold text-white">Tambah Aplikasi Baru</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddLink} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">Judul Aplikasi</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Wikipedia"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 ml-1">URL / Link</label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0_4px_0_#312e81,0_5px_15px_rgba(79,70,229,0.4)] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#312e81,0_8px_20px_rgba(79,70,229,0.5)] active:shadow-[0_0px_0_#312e81] active:translate-y-[4px] transition-all text-white font-bold text-lg"
                  >
                    Simpan Aplikasi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
