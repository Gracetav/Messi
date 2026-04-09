"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminProductsPage() {
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/400x400?text=Sparepart";
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${baseUrl}${imagePath}`;
  };

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    brand_id: '',
    price: 0,
    stock: 0,
    description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data produk:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories`);
      const data = await response.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/brands`);
      const data = await response.json();
      if (Array.isArray(data)) setBrands(data);
    } catch (err) {
      console.error('Gagal mengambil brand:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        price: product.price,
        stock: product.stock,
        description: product.description
      });
      setImageFile(null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        brand_id: brands.length > 0 ? brands[0].id : '',
        price: 0,
        stock: 0,
        description: ''
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus Produk?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Dihapus!',
              text: 'Produk berhasil dihapus dari sistem.',
              timer: 2000,
              showConfirmButton: false
            });
            fetchProducts();
          }
        } catch (err) {
          Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Use FormData for file uploads
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category_id', formData.category_id.toString());
    data.append('brand_id', formData.brand_id.toString());
    data.append('price', formData.price.toString());
    data.append('stock', formData.stock.toString());
    data.append('description', formData.description);
    
    if (imageFile) {
        data.append('image', imageFile);
    } else if (editingProduct && editingProduct.image) {
        data.append('image', editingProduct.image);
    }

    const url = editingProduct 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${editingProduct.id}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`;
    
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: editingProduct ? 'Data produk diperbarui.' : 'Produk baru ditambahkan.',
          timer: 2000,
          showConfirmButton: false
        });
        setIsModalOpen(false);
        fetchProducts();
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
              <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Manajemen <span className="text-primary">Katalog</span></h1>
              <p className="text-slate-500 font-medium">Turunkan, tambah, atau perbarui stok suku cadang Anda</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Produk Baru
            </button>
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary mb-6"></div>
             <p className="text-slate-400 font-bold text-lg animate-pulse">Menghubungkan ke database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
             <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
             </div>
             <p className="text-slate-400 text-xl font-black">Gudang Kosong</p>
             <p className="text-slate-400 mt-2">Belum ada produk yang terdaftar di database.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Produk</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Kategori & Brand</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Harga</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-center">Stok</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                             <img src={getImageUrl(p.image)} className="w-full h-full object-cover" alt={p.name} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg leading-tight group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="w-fit bg-primary/5 text-primary text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-primary/20">
                            {p.category_name || 'Tanpa Kategori'}
                          </span>
                          <span className="w-fit bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-slate-200">
                            {p.brand_name || 'Tanpa Brand'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-800">
                         Rp {Number(p.price).toLocaleString('id-ID')}
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className={`font-black ${p.stock < 10 ? 'text-red-500' : 'text-slate-600'}`}>
                           {p.stock}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex justify-end gap-2 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(p)}
                              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                            >
                               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
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
           <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-10">
              <div className="bg-slate-50 border-b border-slate-100 px-10 py-8 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-800">
                    {editingProduct ? 'Ubah' : 'Tambah'} <span className="text-primary">Produk</span>
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 border border-slate-200">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10">
                 <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2 space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nama Barang</label>
                       <input 
                        type="text" 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold"
                        placeholder="Contoh: Oli Mesin Shell Helix 5L"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</label>
                       <select 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                       >
                         <option value="">Pilih Kategori</option>
                         {categories.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Brand</label>
                       <select 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                        value={formData.brand_id}
                        onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
                       >
                         <option value="">Pilih Brand</option>
                         {brands.map(b => (
                           <option key={b.id} value={b.id}>{b.name}</option>
                         ))}
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Jumlah Stok</label>
                       <input 
                        type="number" 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold"
                        value={formData.stock === 0 ? '' : formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Harga Jual (Rp)</label>
                       <input 
                        type="number" 
                        required
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold"
                        value={formData.price === 0 ? '' : formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Unggah Foto (Device)</label>
                       <div className="relative group/upload">
                         <input 
                          type="file" 
                          accept="image/*"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-500 font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                               setImageFile(e.target.files[0]);
                            }
                          }}
                         />
                         {editingProduct && !imageFile && (
                            <p className="mt-2 text-xs text-slate-400 font-medium italic">
                               File saat ini: <span className="font-bold text-slate-500">{editingProduct.image.split('/').pop()}</span>
                            </p>
                         )}
                       </div>
                    </div>

                    <div className="col-span-2 space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Deskripsi Produk</label>
                       <textarea 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold min-h-[120px]"
                        placeholder="Jelaskan detail spesifikasi produk di sini..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:translate-y-0"
                 >
                   {editingProduct ? 'Simpan Perubahan' : 'Daftarkan Barang Baru'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
