"use client";

import React from 'react';
import { useCart } from './CartContext';

interface ProductProps {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
    description: string;
  };
}

const ProductCard = ({ product }: ProductProps) => {
  const { addToCart } = useCart();

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "https://placehold.co/400x400?text=Sparepart";
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    return `${baseUrl}${imagePath}`;
  };

  return (
    <div className="card w-full max-w-sm overflow-hidden flex flex-col h-full bg-white group shadow-sm border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-primary-light text-primary-dark text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-primary/20">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-slate-800 font-semibold text-lg line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Harga</span>
            <span className="text-primary font-bold text-xl">
              Rp {Number(product.price).toLocaleString("id-ID")}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)}
            className="bg-primary hover:bg-primary-hover text-white p-2.5 rounded-xl shadow-lg shadow-primary/10 hover:scale-110 active:scale-95 transition-all duration-300"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 11 4-7"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M9 11v1"/><path d="M15 11v1"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
