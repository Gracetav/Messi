"use client";

import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../../components/AdminSidebar';
import Swal from 'sweetalert2';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    role: 'user',
    password: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      role: user.role,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Hapus User?',
      text: "User ini akan dihapus permanen dari sistem!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users/${id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            Swal.fire('Terhapus!', 'Pengguna telah dihapus.', 'success');
            fetchUsers();
          }
        } catch (err) {
          Swal.fire('Gagal!', 'Kesalahan saat menghapus user.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire('Berhasil!', 'Data user diperbarui.', 'success');
        setIsModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      Swal.fire('Gagal!', 'Kesalahan saat memperbarui user.', 'error');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <main className="ml-80 flex-grow p-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Manajemen <span className="text-primary">User</span></h1>
            <p className="text-slate-500 font-medium">Kelola hak akses dan akun pengguna aplikasi MessiPart</p>
          </div>

          {loading ? (
            <div className="py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-pulse">
               <p className="text-slate-400 font-bold text-xl">Memuat data pengguna...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Username</th>
                      <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                      <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tanggal Daftar</th>
                      <th className="px-10 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                                {u.username.charAt(0).toUpperCase()}
                             </div>
                             <p className="font-bold text-slate-800 text-lg">{u.username}</p>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-slate-500 font-medium">
                          {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex justify-end gap-2 transition-all">
                             <button 
                                onClick={() => handleOpenModal(u)}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                             </button>
                             <button 
                                onClick={() => handleDelete(u.id)}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-800">Edit <span className="text-primary">Pengguna</span></h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Hak Akses (Role)</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold appearance-none"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                       <option value="user">User / Pelanggan</option>
                       <option value="admin">Administrator</option>
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Ganti Password (Kosongkan jika tidak diubah)</label>
                    <input 
                      type="password" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all text-slate-800 font-bold"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                 </div>

                 <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-1 active:translate-y-0"
                 >
                   Simpan Perubahan
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
