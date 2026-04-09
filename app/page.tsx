"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '../components/ProductCard';
import CartDrawer from '../components/CartDrawer';
import { useCart } from '../components/CartContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LandingPage() {
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { cartCount, addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Format data tidak sesuai:', data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Gagal mengambil data produk:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'admin') {
        router.push('/admin/products');
      }
    }
  }, [router]);

  const categories = Array.isArray(products) ? Array.from(new Set(products.filter(p => p.category_name).map(p => p.category_name))) : [];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    Swal.fire({
      icon: 'info',
      title: 'Sudah Keluar',
      text: 'Sesi Anda telah berakhir. Sampai jumpa lagi!',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    router.refresh();
  };

  const bannerImages = [
    { title: "Katalog Terlengkap", subtitle: "Semua Sparepart Otomotif", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop" },
    { title: "Promo Ramadhan", subtitle: "Diskon up to 50%", img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200&auto=format&fit=crop" },
    { title: "Pengiriman Instan", subtitle: "Hanya 1 Jam Sampai", img: "https://images.unsplash.com/photo-1586528116311-ad861a511855?q=80&w=1200&auto=format&fit=crop" }
  ];

  return (
    <main className="min-h-screen pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20L12 2z"/></svg>
           </div>
           <h1 className="text-xl font-bold text-slate-800 tracking-tight">Messi<span className="text-primary">Part</span></h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
             <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-100 p-2.5 rounded-full text-slate-600 hover:bg-primary-light hover:text-primary transition-all relative group"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
               {cartCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-5 min-w-[20px] rounded-full flex items-center justify-center px-1 border-2 border-white group-hover:scale-110 transition-transform">
                    {cartCount}
                 </span>
               )}
             </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 animate-in fade-in duration-500">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest hidden md:block">{user.username}</span>
              
              <Link href="/orders" className="bg-slate-100 px-4 py-2 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all">
                  Pesanan Saya
              </Link>

              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-md shadow-red-500/10"
                title="Keluar"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
              
              {user.role === 'admin' && (
                <Link href="/admin/products" className="bg-primary px-4 py-2 rounded-lg text-white font-bold text-sm shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Dashboard Admin
                </Link>
              )}
              </div>
            </div>
          ) : (
            <Link 
              href="/login"
              className="bg-primary px-5 py-2 rounded-lg text-white font-semibold text-sm shadow-sm hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              Login
            </Link>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <section className="mt-4 px-6">
        <div className="embla overflow-hidden rounded-[2.5rem]" ref={emblaRef}>
          <div className="embla__container flex h-[480px]">
             {bannerImages.map((b, i) => (
                <div key={i} className="embla__slide flex-[0_0_100%] min-w-0 relative">
                   <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-12 text-white">
                      <p className="text-primary font-black tracking-[0.2em] uppercase mb-3 text-sm">{b.subtitle}</p>
                      <h2 className="text-6xl font-black mb-6 max-w-2xl leading-[1.05]">{b.title}</h2>
                      <button className="bg-primary w-fit px-10 py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-primary/30">Jelajahi Sekarang</button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      <section className="mt-20 px-6">
        <div className="flex items-center justify-between mb-12">
           <div className="flex flex-col">
              <h2 className="text-4xl font-black text-slate-800">Katalog <span className="text-primary">Eksklusif</span></h2>
              <p className="text-slate-500 font-medium text-base">Suku cadang pilihan dengan standar performa tertinggi</p>
           </div>
           <div className="hidden md:flex gap-3">
              <button className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm hover:bg-slate-50">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/></svg>
                 Filter Lanjutan
              </button>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="aspect-square bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-bold text-xl">Belum ada produk untuk ditampilkan</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat} className="mb-16 last:mb-0">
              <div className="flex items-end gap-4 mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{cat}</h3>
                <div className="h-[3px] flex-grow bg-slate-100 rounded-full mb-3"></div>
                <a href="#" className="text-primary text-sm font-black mb-1.5 hover:underline underline-offset-8">LIHAT SEMUA</a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {products.filter(p => p.category_name === cat).map((p) => (
                  <ProductCard key={p.id} product={p} onOpenDetail={() => setSelectedProduct(p)} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section className="bg-slate-900 mx-6 rounded-[3rem] p-16 flex flex-wrap justify-around items-center gap-12 mt-24 overflow-hidden relative shadow-3xl shadow-primary/10 border border-white/5">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/40 opacity-10 blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
         {[
           { val: "15k+", label: "Produk Terjual", icon: "📦" },
           { val: "150+", label: "Bengkel Rekanan", icon: "🛠️" },
           { val: "24h", label: "Layanan Pelanggan", icon: "📞" },
           { val: "100%", label: "Garansi Orisinal", icon: "🛡️" }
         ].map((stat, i) => (
           <div key={i} className="text-center z-10 flex flex-col items-center">
             <div className="w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-5 border border-white/10 group-hover:scale-110 transition-all">{stat.icon}</div>
             <p className="text-primary text-6xl font-black mb-2 tracking-tighter">{stat.val}</p>
             <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">{stat.label}</p>
           </div>
         ))}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-slate-100 relative">
                 <img 
                   src={selectedProduct.image.startsWith('http') ? selectedProduct.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${selectedProduct.image}`} 
                   className="w-full h-full object-cover aspect-square" 
                   alt={selectedProduct.name} 
                 />
                 <button 
                  onClick={() => setSelectedProduct(null)} 
                  className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-800 hover:bg-white transition-all shadow-lg"
                 >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                 </button>
              </div>
              <div className="md:w-1/2 p-12 flex flex-col">
                 <div className="mb-8">
                    <span className="bg-primary/10 text-primary text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full border border-primary/20 uppercase">
                        {selectedProduct.category_name}
                    </span>
                    <h2 className="text-4xl font-black text-slate-800 mt-4 leading-tight">{selectedProduct.name}</h2>
                    <p className="text-3xl font-black text-primary mt-4">Rp {Number(selectedProduct.price).toLocaleString('id-ID')}</p>
                 </div>

                 <div className="flex-grow overflow-y-auto pr-4 mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Deskripsi Produk</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">
                        {selectedProduct.description || 'Tidak ada deskripsi untuk produk ini.'}
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                        setIsCartOpen(true);
                      }}
                      className="flex-grow bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
                    >
                        Tambah ke Keranjang
                    </button>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                    >
                        Tutup
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="mt-40 border-t border-slate-100 p-16 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col items-center">
           <div className="flex items-center gap-3 mb-8">
              <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20L12 2z"/></svg>
              </div>
              <p className="font-black text-2xl text-slate-800 tracking-tight">Messi<span className="text-primary">Part</span></p>
           </div>
           
           <p className="text-slate-500 font-medium text-center max-w-sm mb-12 italic">"Sistem Penjualan Suku Cadang Terpadu Berbasis Awan dengan Performa Optimal."</p>
           
           <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 mb-12">
              <a href="#" className="text-slate-800 font-bold hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">TENTANG KAMI</a>
              <a href="#" className="text-slate-800 font-bold hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">SYARAT & KETENTUAN</a>
              <a href="#" className="text-slate-800 font-bold hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">KEBIJAKAN PRIVASI</a>
              <a href="#" className="text-slate-800 font-bold hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">BANTUAN</a>
           </div>

           <div className="w-full h-px bg-slate-100 mb-12"></div>
           
           <p className="text-sm text-slate-400 font-medium">© 2026 MessiPart. Built with Unified Architecture. All Rights Reserved.</p>
         </div>
      </footer>
    </main>
  );
}
