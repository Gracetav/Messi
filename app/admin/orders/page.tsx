"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${baseUrl}${imagePath}`;
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Data order bukan array:', data);
        setOrders([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data order:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    let statusLabel = '';
    switch(status) {
        case 'confirmed': statusLabel = 'Dikonfirmasi'; break;
        case 'shipped': statusLabel = 'Dikirim'; break;
        case 'completed': statusLabel = 'Selesai'; break;
        case 'cancelled': statusLabel = 'Dibatalkan'; break;
        default: statusLabel = status;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: `Pesanan #${orderId} ${statusLabel}`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        fetchOrders();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Update',
        text: 'Terjadi kesalahan sistem saat memperbarui status.'
      });
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      <main className="ml-80 flex-grow p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Manajemen <span className="text-primary">Pesanan</span></h1>
              <p className="text-slate-500 font-medium">Pantau dan kelola alur transaksi sparepart</p>
            </div>
            <button 
              onClick={fetchOrders}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
            >
              Segarkan Data
            </button>
          </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <p className="text-slate-400 font-bold">Belum ada pesanan masuk</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                      <span className="bg-primary/10 text-primary font-black px-4 py-2 rounded-xl text-lg">#{order.id}</span>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pelanggan</p>
                         <p className="font-bold text-slate-700">{order.username || 'User Pelanggan'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      {order.payment_proof && (
                        <button 
                          onClick={() => Swal.fire({ 
                              title: 'Bukti Pembayaran',
                              imageUrl: getImageUrl(order.payment_proof),
                              imageAlt: 'Bukti',
                              confirmButtonText: 'Tutup'
                          })}
                          className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all"
                        >
                          Lihat Bukti
                        </button>
                      )}
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        order.status === 'confirmed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {order.status === 'pending' ? 'Pending' :
                         order.status === 'confirmed' ? 'Dikonfirmasi' :
                         order.status === 'shipped' ? 'Dikirim' :
                         order.status === 'completed' ? 'Selesai' : 'Batal'}
                      </span>
                   </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-4">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Transaksi</p>
                         <p className="text-2xl font-black text-slate-800">Rp {Number(order.total_price).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kontak & Alamat</p>
                         <p className="text-xs font-bold text-slate-700">{order.phone || 'No HP -'}</p>
                         <p className="text-xs text-slate-500 mt-1">{order.address || 'Alamat -'}</p>
                      </div>
                   </div>

                   <div className="md:col-span-2 flex flex-col justify-between">
                      <div className="flex gap-4 items-center">
                         {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <div className="flex flex-wrap gap-2">
                               {order.status === 'pending' && (
                                  <button 
                                    onClick={() => updateStatus(order.id, 'confirmed')}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all"
                                  >
                                    Konfirmasi Bayar
                                  </button>
                               )}
                               {order.status === 'confirmed' && (
                                  <button 
                                    onClick={() => updateStatus(order.id, 'shipped')}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-105 transition-all"
                                  >
                                    Kirim Barang
                                  </button>
                               )}
                               {order.status === 'shipped' && (
                                  <button 
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all"
                                  >
                                    Selesai
                                  </button>
                               )}
                               <button 
                                 onClick={() => updateStatus(order.id, 'cancelled')}
                                 className="bg-white text-red-500 border border-red-100 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
                               >
                                 Batal
                               </button>
                            </div>
                         )}
                         {order.status === 'completed' && <p className="text-emerald-500 font-black italic">Transaksi telah selesai!</p>}
                         {order.status === 'cancelled' && <p className="text-red-500 font-black italic">Pesanan dibatalkan.</p>}
                      </div>
                      
                      <p className="text-xs text-slate-400 font-medium">Dibuat pada {new Date(order.created_at).toLocaleString('id-ID')}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
