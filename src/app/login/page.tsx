'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, ShieldCheck, Lock, User, ArrowRight, AlertCircle, Wrench, Shield, HardHat } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Wpisz login i hasło');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nieprawidłowe dane logowania');
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd logowania';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Nieprawidłowe dane logowania');
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd logowania';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-900/30 mb-4">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            Oplast<span className="text-emerald-400">Asist</span>
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              DTR
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cyfrowy rejestr maszyn, szaf sterowniczych, dokumentacji i zmian połączeń
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-base font-bold text-slate-200 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            Logowanie do systemu
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Dostęp wymaga autoryzacji pracowniczej działu UR lub produkcji.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nazwa użytkownika
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="np. admin, automatyk, operator"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hasło
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? (
                <span>Logowanie...</span>
              ) : (
                <>
                  <span>Zaloguj się</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Szybkie logowanie testowe (konta demonstracyjne):
            </div>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      Jan Kowalski
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rola: <span className="text-purple-400 font-semibold">Kierownik UR (Admin)</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('automatyk', 'auto123')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      Marek Nowak
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rola: <span className="text-emerald-400 font-semibold">Główny Automatyk (UR)</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">auto123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operator', 'oper123')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                      Tomasz Wiśniewski
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Rola: <span className="text-blue-400 font-semibold">Operator Produkcji</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">oper123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          Oplast Sp. z o.o. • Dział Utrzymania Ruchu & Automatyki
        </div>
      </div>
    </div>
  );
}
