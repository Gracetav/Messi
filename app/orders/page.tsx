"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${baseUrl}${imagePath}`;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchUserOrders(u.id);
    } else {
        setLoading(false);
    }
  }, []);

  const fetchUserOrders = async (userId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/user/${userId}`);
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Gagal mengambil pesanan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (orderId: number, file: File) => {
    const formData = new FormData();
    formData.append('payment_proof', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/${orderId}/payment-proof`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Bukti pembayaran telah terkirim.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUserOrders(user.id);
      } else {
        Swal.fire('Gagal!', 'Gagal mengunggah bukti.', 'error');
      }
    } catch (err) {
      Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
         <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md">
            <h1 className="text-2xl font-black text-slate-800 mb-4">Akses Terbatas</h1>
            <p className="text-slate-500 mb-8">Silakan login untuk melihat riwayat pesanan Anda.</p>
            <Link href="/login" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold">Login Sekarang</Link>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-10 px-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-12">
            <div>
                <Link href="/" className="text-primary font-bold text-sm mb-4 inline-block hover:underline">&larr; Kembali ke Toko</Link>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Pesanan <span className="text-primary">Saya</span></h1>
                <p className="text-slate-500 font-medium">Pantau status transaksi Anda secara real-time</p>
            </div>
        </div>

        {loading ? (
          <div className="py-20 text-center animate-pulse">Memuat data pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] shadow-sm text-center border border-dashed border-slate-200">
             <p className="text-slate-400 font-bold text-xl">Belum ada pesanan.</p>
             <Link href="/" className="text-primary font-bold mt-4 inline-block">Mulai belanja &rarr;</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                 <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ID Pesanan</p>
                           <p className="font-black text-slate-800">#MP-{order.id}</p>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200"></div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tanggal</p>
                           <p className="font-bold text-slate-600">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200"></div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Metode</p>
                           <p className="font-bold text-slate-600 uppercase text-[10px] tracking-widest bg-slate-200 px-2 py-1 rounded-md">{order.payment_method || 'transfer'}</p>
                        </div>
                    </div>
                    
                    <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      order.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {order.status === 'pending' ? 'Menunggu Konfirmasi' : 
                       order.status === 'confirmed' ? 'Pembayaran Diterima' :
                       order.status === 'shipped' ? 'Barang Dikirim' :
                       order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </span>
                 </div>
                 
                 <div className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Bayar</p>
                        <p className="text-2xl font-black text-primary">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        {order.status === 'pending' && order.payment_method !== 'cod' && (
                            <button 
                                onClick={() => Swal.fire({
                                    title: 'Informasi Pembayaran',
                                    html: `
                                        <div class="text-left space-y-4">
                                            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                                <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Bank Penerima</p>
                                                <p class="text-lg font-black text-blue-900">BCA (Bank Central Asia)</p>
                                                <p class="text-2xl font-black text-blue-600 mt-2">123 456 7890</p>
                                                <p class="text-sm font-bold text-blue-800">a/n PT MESSI PART INDONESIA</p>
                                            </div>
                                            <p class="text-sm text-slate-500">Silakan transfer sesuai nominal <b>Rp ${Number(order.total_price).toLocaleString('id-ID')}</b> dan unggah bukti transfer di bawah.</p>
                                        </div>
                                    `,
                                    icon: 'info',
                                    confirmButtonColor: '#16a34a'
                                })}
                                className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                            >
                                Cara Bayar
                            </button>
                        )}

                        {(order.status === 'pending') && order.payment_method !== 'cod' && (
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id={`proof-${order.id}`}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleUploadProof(order.id, e.target.files[0]);
                                        }
                                    }}
                                />
                                <button 
                                    onClick={() => document.getElementById(`proof-${order.id}`)?.click()}
                                    className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all ${
                                        order.payment_proof 
                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20 underline' 
                                        : 'bg-primary text-white shadow-primary/20 hover:scale-105'
                                    }`}
                                >
                                    {order.payment_proof ? 'Ganti Bukti Transfer' : 'Upload Bukti Transfer'}
                                </button>
                            </div>
                        )}

                        {order.payment_method === 'cod' && order.status === 'pending' && (
                            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                                <p className="text-blue-600 font-bold text-sm">Metode COD: Bayar saat barang sampai</p>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 {order.payment_proof && (order.status === 'pending' || order.status === 'confirmed') && (
                    <div className="px-8 pb-8">
                       <div className="flex flex-col gap-3">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bukti Terkirim</p>
                          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                               onClick={() => Swal.fire({
                                   imageUrl: getImageUrl(order.payment_proof),
                                   imageAlt: 'Bukti Pembayaran',
                                   title: 'Bukti Pembayaran Anda',
                                   confirmButtonText: 'Tutup'
                               })}>
                             <img src={getImageUrl(order.payment_proof) || ''} className="w-full h-full object-cover" alt="Bukti" />
                          </div>
                       </div>
                    </div>
                 )}
                 
                 {order.status === 'shipped' && (
                    <div className="px-8 pb-8 animate-in slide-in-from-bottom-2">
                        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v1"/><rect x="13" y="10" width="10" height="11" rx="2"/><path d="M13 15h10"/><path d="M16 18h4"/><path d="M13 7h10l2 3v10c0 1.1-.9 2-2 2h-1"/></svg>
                            </div>
                            <div>
                                <p className="text-blue-900 font-black text-lg italic">Pesanan sedang meluncur ke lokasi Anda!</p>
                                <p className="text-blue-600 text-sm font-medium">Terima kasih telah berbelanja di MessiPart. Mohon tunggu paket tiba.</p>
                            </div>
                        </div>
                    </div>
                 )}

                 {order.status === 'confirmed' && (
                    <div className="px-8 pb-8">
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">✓</div>
                             <p className="text-xs text-indigo-700 font-medium">Pembayaran Anda telah diverifikasi. Kami sedang menyiapkan barang untuk dikirim.</p>
                        </div>
                    </div>
                 )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
