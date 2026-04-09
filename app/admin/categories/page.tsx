"use client";

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });
  
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus Kategori?',
      text: "Produk dengan kategori ini mungkin akan terpengaruh!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Dihapus!',
              text: 'Kategori berhasil dihapus.',
              timer: 2000,
              showConfirmButton: false
            });
            fetchCategories();
          }
        } catch (err) {
          Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingCategory 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories/${editingCategory.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories`;
    
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: editingCategory ? 'Data kategori diperbarui.' : 'Kategori baru ditambahkan.',
          timer: 2000,
          showConfirmButton: false
        });
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const error = await response.json();
        Swal.fire('Gagal!', error.message || 'Gagal menyimpan data.', 'error');
      }
    } catch (err) {
       Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingCategory) {
        setFormData(prev => ({ ...prev, slug: prev.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') }));
    }
  }, [formData.name, editingCategory]);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <main className="ml-80 flex-grow p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Manajemen <span className="text-primary">Kategori</span></h1>
              <p className="text-slate-500 font-medium">Atur kategori produk untuk memudahkan pencarian</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Kategori Baru
            </button>
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary mb-6"></div>
             <p className="text-slate-400 font-bold text-lg animate-pulse">Menghubungkan ke database...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
             </div>
             <p className="text-slate-400 text-xl font-black">Belum Ada Kategori</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center w-20">ID</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Nama Kategori</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Slug</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-slate-400 font-bold text-center">#{c.id}</td>
                      <td className="px-8 py-5">
                          <p className="font-bold text-slate-800 text-lg leading-tight group-hover:text-primary transition-colors">{c.name}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full border border-slate-200">
                          {c.slug}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex justify-end gap-2 text-right">
                            <button 
                              onClick={() => handleOpenModal(c)}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)}
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
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-10">
              <div className="bg-slate-50 border-b border-slate-100 px-10 py-8 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-800">
                    {editingCategory ? 'Ubah' : 'Tambah'} <span className="text-primary">Kategori</span>
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 border border-slate-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                 <div className="space-y-6 mb-8">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Kategori</label>
                       <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold"
                        placeholder="Contoh: Suku Cadang Mesin"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Slug (URL Friendly)</label>
                       <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-500 font-bold"
                        placeholder="suku-cadang-mesin"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:translate-y-0"
                 >
                   {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
