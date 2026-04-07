"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in as admin
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') {
        router.push('/admin/products');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: `Selamat datang kembali, ${data.user.username}`,
          timer: 2000,
          showConfirmButton: false
        });
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin/products');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || 'Login gagal, periksa kembali username/password.');
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: data.message || 'Username atau password salah.',
          confirmButtonColor: '#16a34a'
        });
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan backend sudah dijalankan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-gradient-to-br from-primary-light/30 to-white">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-6 scale-animation animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-12 hover:rotate-0 transition-transform">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20L12 2z"/></svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Masuk ke <span className="text-primary">MessiPart</span></h1>
          <p className="text-slate-500 text-sm">Akses katalog sparepart terbaik Anda</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <input 
              type="text" 
              required
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-800"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-800"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="mt-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Menghubungkan...' : 'Login Sekarang'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 border-t border-slate-100 pt-6 mt-2">
           <p className="text-slate-500 text-sm">Belum punya akun?</p>
           <Link href="/register" className="text-primary font-bold hover:underline">
              Buat Akun MessiPart Sekarang
           </Link>
        </div>
      </div>
    </main>
  );
}
