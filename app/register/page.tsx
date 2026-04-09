"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: 'user' }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil!',
          text: 'Akun Anda telah terdaftar. Silakan masuk untuk mulai belanja.',
          confirmButtonColor: '#16a34a',
        }).then(() => {
          router.push('/login');
        });
      } else {
        setError(data.message || 'Registrasi gagal, coba username lain.');
        Swal.fire({
          icon: 'error',
          title: 'Registrasi Gagal',
          text: data.message || 'Username sudah digunakan atau data tidak valid.',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      setError('Gagal menghubungi server backend.');
      Swal.fire('Error', 'Gagal menghubungi server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-gradient-to-tr from-primary-light/40 to-white">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in slide-in-from-bottom-5 duration-500">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="bg-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20L12 2z"/></svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Daftar di <span className="text-primary">MessiPart</span></h1>
          <p className="text-slate-500 text-sm">Bergabung dengan ekosistem sparepart terbaik</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <input 
              type="text" 
              required
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-800"
              placeholder="Pilih username unik"
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
              placeholder="Masukkan password kuat"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Konfirmasi Password</label>
            <input 
              type="password" 
              required
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-slate-800"
              placeholder="Ulangi password Anda"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="mt-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 border-t border-slate-100 pt-6 mt-2">
           <p className="text-slate-500 text-sm">Sudah punya akun?</p>
           <Link href="/login" className="text-primary font-bold hover:underline">
              Masuk ke MessiPart Sekarang
           </Link>
        </div>
      </div>
    </main>
  );
}
