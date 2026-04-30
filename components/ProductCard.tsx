"use client";

import React from 'react';
import { useCart } from './CartContext';

interface ProductProps {
  product: {
    id: number;
    name: string;
    category_name: string;
    price: number;
    stock: number;
    image: string;
    description: string;
  };
  onOpenDetail?: () => void;
}

const ProductCard = ({ product, onOpenDetail }: ProductProps) => {
  const { addToCart } = useCart();

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/400x400?text=Sparepart";
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="card w-full max-w-sm overflow-hidden flex flex-col h-full bg-white group shadow-sm border border-slate-100 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div 
        className="relative aspect-square w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={onOpenDetail}
      >
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] uppercase font-black px-3 py-1.5 rounded-full border border-slate-100 shadow-sm w-fit">
            {product.category_name}
          </span>
          <span className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full border shadow-sm w-fit ${product.stock > 0 ? 'bg-green-500/90 text-white border-green-600' : 'bg-red-500/90 text-white border-red-600'}`}>
            {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <span className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">Lihat Detail</span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 
          className="text-slate-800 font-black text-xl line-clamp-1 mb-2 group-hover:text-primary transition-colors cursor-pointer"
          onClick={onOpenDetail}
        >
          {product.name}
        </h3>
        <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-6 flex-grow leading-relaxed">
          {product.description || 'Suku cadang berkualitas tinggi untuk performa kendaraan maksimal.'}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5 ml-0.5">Harga</span>
            <span className="text-primary font-black text-2xl tracking-tight">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)}
            className="bg-slate-900 hover:bg-black text-white p-4 rounded-2xl shadow-xl shadow-slate-900/10 hover:scale-110 active:scale-95 transition-all duration-300 group/btn"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-12 transition-transform" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M9 11v1"/><path d="M15 11v1"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
