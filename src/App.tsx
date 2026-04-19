import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Download, 
  Upload, 
  LayoutDashboard, 
  Globe, 
  X,
  ExternalLink,
  Menu,
  Loader2
} from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

type AppLink = {
  id: string;
  title: string;
  url: string;
  createdAt?: any;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from Firestore on mount
  useEffect(() => {
    const q = query(collection(db, 'links'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppLink[];
      
      setLinks(fetchedLinks);
      
      if (fetchedLinks.length > 0 && !selectedLink) {
        setSelectedLink(fetchedLinks[0]);
      } else if (fetchedLinks.length === 0) {
        setSelectedLink(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching links: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      await addDoc(collection(db, 'links'), {
        title: newTitle.trim(),
        url: formattedUrl,
        createdAt: serverTimestamp()
      });
      
      setNewTitle('');
      setNewUrl('');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding link: ", error);
      alert("Gagal menambahkan link. Pastikan Anda memiliki koneksi internet.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'links', id));
      if (selectedLink?.id === id) {
        setSelectedLink(null);
      }
    } catch (error) {
      console.error("Error deleting link: ", error);
      alert("Gagal menghapus link.");
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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedLinks = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedLinks)) {
          // Add all imported links to Firestore
          for (const link of importedLinks) {
            if (link.title && link.url) {
              await addDoc(collection(db, 'links'), {
                title: link.title,
                url: link.url,
                createdAt: serverTimestamp()
              });
            }
          }
          alert('Links berhasil di-import ke database!');
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
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-blue-200">
      {/* Background Ambient Glow - Soft Blue & Soft Red */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-rose-300/30 blur-[120px] pointer-events-none" />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-80 flex flex-col bg-white/95 md:bg-white/70 backdrop-blur-2xl border-r border-slate-200/80 shadow-[10px_0_30px_rgba(0,0,0,0.05)] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200/80 flex items-center gap-3 bg-white/50">
          <img 
            src="https://iili.io/KDFk4fI.png" 
            alt="Logo SPANJU" 
            className="w-12 h-12 object-contain drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-rose-500 leading-tight">
            8 PROGRAM PRIORITAS SPANJU
          </h1>
        </div>

        {/* Links List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-sm font-medium">Memuat data...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              Belum ada aplikasi. Tambahkan sekarang!
            </div>
          ) : (
            <AnimatePresence>
              {links.map((link) => {
              const isSelected = selectedLink?.id === link.id;
              return (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => {
                      if (link.url.includes('sites.google.com')) {
                        window.open(link.url, '_blank');
                      }
                      setSelectedLink(link);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`group relative w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border
                      ${isSelected 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-transparent shadow-[0_8px_20px_rgba(59,130,246,0.25)] text-white translate-y-[-2px]' 
                        : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 hover:translate-y-[-2px] text-slate-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Globe size={18} className={isSelected ? 'text-blue-100' : 'text-blue-400'} />
                      <span className="font-medium truncate">
                        {link.title}
                      </span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
            </AnimatePresence>
          )}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-200/80 space-y-3 bg-white/50">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-rose-400 shadow-[0_8px_20px_rgba(59,130,246,0.2)] hover:shadow-[0_10px_25px_rgba(59,130,246,0.3)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all text-white font-semibold"
          >
            <Plus size={20} />
            Tambah Aplikasi
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-blue-600 active:translate-y-[1px] transition-all text-slate-600 text-sm font-medium"
            >
              <Download size={16} />
              Backup
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-blue-600 active:translate-y-[1px] transition-all text-slate-600 text-sm font-medium"
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
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 relative z-10 flex flex-col w-full overflow-hidden">
        <div className="flex-1 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl md:rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden relative flex flex-col">
          
          {/* Top Bar of the Iframe Container */}
          <div className="h-12 bg-slate-50/80 border-b border-slate-200/80 flex items-center px-2 md:px-4 gap-2 md:gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>
            </div>
            <div className="flex-1 flex justify-center overflow-hidden px-2">
              {selectedLink && (
                <div className="bg-white px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs text-slate-500 border border-slate-200 flex items-center gap-2 shadow-sm max-w-full">
                  <Globe size={12} className="text-blue-400 shrink-0" />
                  <span className="truncate">{selectedLink.url}</span>
                </div>
              )}
            </div>
            <div className="flex gap-1 md:gap-2 shrink-0">
              {selectedLink && (
                <a 
                  href={selectedLink.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                  title="Buka di tab baru (jika diblokir)"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Buka di Tab Baru</span>
                </a>
              )}
            </div>
          </div>

          {/* Iframe or Empty State */}
          <div className="flex-1 relative bg-slate-50/30">
            <AnimatePresence mode="wait">
              {selectedLink ? (
                <motion.iframe
                  key={selectedLink.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={selectedLink.url}
                  className="w-full h-full border-none bg-white"
                  title={selectedLink.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center"
                >
                  <div className="w-32 h-32 mb-6 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl animate-pulse"></div>
                    <LayoutDashboard size={80} className="text-blue-300 relative z-10 drop-shadow-lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-700 mb-2">Pilih Aplikasi</h2>
                  <p className="max-w-md text-slate-500">
                    Pilih aplikasi dari menu di sebelah kiri untuk membukanya di sini. 
                    Anda juga dapat menambahkan link aplikasi baru.
                  </p>
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
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">Tambah Aplikasi Baru</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddLink} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Judul Aplikasi</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Wikipedia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">URL / Link</label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_10px_25px_rgba(59,130,246,0.35)] hover:translate-y-[-2px] active:translate-y-[1px] transition-all text-white font-bold text-lg"
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

