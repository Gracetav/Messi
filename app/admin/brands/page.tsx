"use client";

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminBrandsPage() {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/200x200?text=Brand";
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${baseUrl}${imagePath}`;
  };

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const fetchBrands = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/brands`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setBrands(data);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data brand:', err);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand: any = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || ''
      });
      setImageFile(null);
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        description: ''
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus Brand?',
      text: "Data brand yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/brands/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Dihapus!',
              text: 'Brand berhasil dihapus.',
              timer: 2000,
              showConfirmButton: false
            });
            fetchBrands();
          }
        } catch (err) {
          Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use FormData for file uploads
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    
    if (imageFile) {
        data.append('image', imageFile);
    } else if (editingBrand && editingBrand.image) {
        data.append('image', editingBrand.image);
    }

    const url = editingBrand 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/brands/${editingBrand.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/brands`;
    
    const method = editingBrand ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        body: data,
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: editingBrand ? 'Data brand diperbarui.' : 'Brand baru ditambahkan.',
          timer: 2000,
          showConfirmButton: false
        });
        setIsModalOpen(false);
        fetchBrands();
      } else {
        const error = await response.json();
        Swal.fire('Gagal!', error.message || 'Gagal menyimpan data.', 'error');
      }
    } catch (err) {
       Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <main className="ml-80 flex-grow p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Manajemen <span className="text-primary">Brand</span></h1>
              <p className="text-slate-500 font-medium">Kelola merek-merek suku cadang yang Anda jual</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Brand Baru
            </button>
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary mb-6"></div>
             <p className="text-slate-400 font-bold text-lg animate-pulse">Menghubungkan ke database...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
             </div>
             <p className="text-slate-400 text-xl font-black">Belum Ada Brand</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Logo & Brand</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Deskripsi</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200 p-1">
                              <img src={getImageUrl(b.image)} className="w-full h-full object-contain" alt={b.name} />
                           </div>
                           <p className="font-bold text-slate-800 text-lg leading-tight group-hover:text-primary transition-colors">{b.name}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                         <p className="text-slate-500 text-sm line-clamp-2">{b.description || '-'}</p>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex justify-end gap-2 text-right">
                            <button 
                              onClick={() => handleOpenModal(b)}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(b.id)}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-10">
              <div className="bg-slate-50 border-b border-slate-100 px-10 py-8 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-800">
                    {editingBrand ? 'Ubah' : 'Tambah'} <span className="text-primary">Brand</span>
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 border border-slate-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                 <div className="space-y-6 mb-8">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Brand</label>
                       <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold"
                        placeholder="Contoh: Honda, Yamaha, Shell"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Logo Brand</label>
                       <input 
                        type="file" 
                        accept="image/*"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none transition-all text-slate-500 font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-primary/10 file:text-primary cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Deskripsi Singkat</label>
                       <textarea 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold min-h-[100px]"
                        placeholder="Detail brand..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:translate-y-0"
                 >
                   {editingBrand ? 'Simpan Perubahan' : 'Tambah Brand'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
