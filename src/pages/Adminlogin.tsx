import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import urbanLogo from '../assets/urban-logo.svg'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.hash = '#/admin'
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E2431] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden flex flex-col justify-center items-center p-4">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-karken-green/10 dark:bg-karken-green/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-karken-yellow/10 dark:bg-karken-yellow/10 blur-[100px] pointer-events-none" />

      {/* Floating Theme Switch */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Glassmorphic Form Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 shadow-2xl relative z-10 space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 mx-auto shadow-md p-1.5 bg-white/5">
            <img src={urbanLogo} alt="Urban Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-display tracking-wide text-slate-800 dark:text-white leading-none">URBAN</h2>
            <p className="text-[10px] font-bold text-karken-green dark:text-karken-yellow tracking-widest mt-1 uppercase">Propiedades · Panel de Administración</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all"
                placeholder="admin@urbanpropiedades.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200/50 dark:border-rose-500/20 text-center">
              {error === 'Invalid login credentials' ? 'Credenciales incorrectas' : error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-karken-green hover:bg-[#16401f] text-white font-bold rounded-xl shadow-md shadow-karken-green/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-karken-green dark:hover:text-karken-yellow transition-all"
          >
            <ArrowLeft size={12} />
            <span>Volver al catálogo público</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
