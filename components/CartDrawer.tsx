"use client";

import React, { useState } from 'react';
import { useCart } from './CartContext';
import Swal from 'sweetalert2';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);
  const [shipData, setShipData] = useState({
    address: '',
    phone: ''
  });

  const handleCheckout = async () => {
    if (!showShipForm) {
      if (cart.length === 0) return;
      setShowShipForm(true);
      return;
    }

    if (!shipData.address || !shipData.phone) {
      Swal.fire('Info', 'Mohon lengkapi alamat dan nomor HP.', 'warning');
      return;
    }

    const userJson = localStorage.getItem('user');
    if (!userJson) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Diperlukan',
        text: 'Silakan login terlebih dahulu untuk melakukan checkout.',
        confirmButtonColor: '#16a34a',
        showCancelButton: true,
        confirmButtonText: 'Login Sekarang',
        cancelButtonText: 'Nanti Saja'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    const user = JSON.parse(userJson);
    setIsCheckingOut(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          total_price: totalPrice,
          items: cart,
          address: shipData.address,
          phone: shipData.phone
        }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Checkout Berhasil!',
          html: `
            <div class="text-left space-y-4">
              <p>Pesanan Anda telah diterima. Silakan lakukan pembayaran ke rekening berikut:</p>
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p class="font-bold text-slate-400 text-xs uppercase tracking-widest">Bank Central Asia (BCA)</p>
                <p class="text-xl font-black text-slate-800">123 456 7890</p>
                <p class="text-sm font-bold text-slate-600">a/n PT MESSI PART INDONESIA</p>
              </div>
              <p class="text-sm text-slate-500 italic">*Konfirmasi akan diproses dalam 1x24 jam oleh admin.</p>
            </div>
          `,
          confirmButtonColor: '#16a34a',
          confirmButtonText: 'Saya Mengerti'
        });
        clearCart();
        setShowShipForm(false);
        onClose();
      } else {
        const data = await response.json();
        Swal.fire('Error', data.message || 'Gagal checkout', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Terjadi kesalahan koneksi.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col scale-in-hor-right">
          <div className="flex-1 flex flex-col py-6 overflow-hidden">
            <div className="px-6 flex items-start justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800">
                {showShipForm ? 'Informasi' : 'Keranjang'} <span className="text-primary">{showShipForm ? 'Pengiriman' : 'Belanja'}</span>
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-6 py-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="m9 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/></svg>
                  </div>
                  <p className="text-slate-400 font-bold">Keranjang Anda kosong</p>
                  <button onClick={onClose} className="mt-4 text-primary font-bold text-sm">Mulai Belanja &rarr;</button>
                </div>
              ) : showShipForm ? (
                <div className="space-y-6 animate-in slide-in-from-right-10 duration-300">
                  <button 
                    onClick={() => setShowShipForm(false)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest mb-4"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Kembali ke Keranjang
                  </button>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Alamat Lengkap</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold text-slate-800 text-sm h-32"
                      placeholder="Masukkan alamat pengiriman Anda..."
                      value={shipData.address}
                      onChange={(e) => setShipData({...shipData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nomor WhatsApp</label>
                    <input 
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary transition-all font-bold text-slate-800 text-sm"
                      placeholder="Contoh: 08123456789"
                      value={shipData.phone}
                      onChange={(e) => setShipData({...shipData, phone: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow py-1">
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                        <p className="text-primary font-black text-sm mt-0.5">Rp {item.price.toLocaleString('id-ID')}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-800 transition-colors">&minus;</button>
                            <span className="font-black text-slate-800 text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-400 hover:text-slate-800 transition-colors">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors ml-auto opacity-0 group-hover:opacity-100">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex justify-between items-end mb-6">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Belanja</span>
              <span className="text-2xl font-black text-slate-800">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0 relative overflow-hidden"
            >
              {isCheckingOut ? (
                <div className="flex items-center justify-center gap-2">
                   <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                   Memproses...
                </div>
              ) : showShipForm ? 'Pesan Sekarang' : 'Lanjut ke Alamat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
