import { useEffect, useState } from 'react'
import { requireAuth } from '../lib/requireAuth'
import { supabase } from '../lib/supabaseClient'
import PropertyForm, { Property } from '../sections/PropertyForm'
import ThemeToggle from '../components/ThemeToggle'
import urbanLogo from '../assets/urban-logo.svg'
import propertiesData from '../data/properties.json'
import { PlusCircle, LogOut, FileText, Trash2, Edit3, ArrowLeft, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [editing, setEditing] = useState<Property | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    requireAuth().then(() => {
      load()
    })
  }, [])

  async function load() {
    try {
      const { data, error } = await supabase
        .from('v_properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error || !data || data.length === 0) {
        setItems(propertiesData as any[])
      } else {
        setItems(data)
      }
    } catch {
      setItems(propertiesData as any[])
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.hash = '#/admin/login'
  }

  function startEdit(p: any) {
    const toEdit: Property = {
      id: p.id,
      title: p.title,
      operation: p.operation,
      type: p.type,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      total_m2: p.total_m2,
      price: p.price,
      currency: p.currency || 'USD',
      city: p.city,
      province: p.province,
      description: p.description || ''
    }
    setEditing(toEdit)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(p: any) {
    if (!confirm('¿Borrar la propiedad y TODAS sus imágenes?')) return
    try {
      setBusyId(p.id)

      const paths = await listAllPaths(p.id)

      if (paths.length) {
        const { error: delErr } = await supabase.storage.from('properties').remove(paths)
        if (delErr) throw delErr
      }

      const { error: imgErr } = await supabase.from('property_images').delete().eq('property_id', p.id)
      if (imgErr) throw imgErr

      const { error: propErr } = await supabase.from('properties').delete().eq('id', p.id)
      if (propErr) throw propErr
    } catch (e) {
      console.error('Error al borrar:', e)
      alert('No se pudo borrar. Revisá la consola para más detalles.')
    } finally {
      setBusyId(null)
      load()
    }
  }

  async function listAllPaths(prefix: string): Promise<string[]> {
    const all: string[] = []
    const pageSize = 100

    async function listDir(dir: string) {
      let offset = 0
      while (true) {
        const { data, error } = await supabase.storage.from('properties').list(dir, {
          limit: pageSize,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        })
        if (error) throw error
        if (!data || data.length === 0) break

        for (const item of data) {
          const isFile = (item as any).id != null
          const path = dir ? `${dir}/${item.name}` : item.name
          if (isFile) {
            all.push(path)
          } else {
            await listDir(path)
          }
        }

        if (data.length < pageSize) break
        offset += pageSize
      }
    }

    await listDir(prefix)
    return all
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E2431] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden pb-16">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-karken-green/10 dark:bg-karken-green/15 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-karken-yellow/10 dark:bg-karken-yellow/10 blur-[100px] pointer-events-none" />

      {/* Header pegajoso */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0E2431]/70 border-b border-slate-200/50 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner p-1 bg-white/5">
              <img src={urbanLogo} alt="Urban Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-lg font-black tracking-wider font-display text-karken-dark dark:text-white leading-none">URBAN</div>
              <div className="text-[9px] font-bold text-karken-green dark:text-karken-yellow tracking-widest mt-1">ADMINISTRACIÓN</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-white/5 px-3.5 py-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all text-xs sm:text-sm"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Ver web pública</span>
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-3.5 py-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all text-xs sm:text-sm cursor-pointer"
            >
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          </div>

        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Formulario de Nueva / Edición de propiedad */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/50 dark:border-white/5">
            <PlusCircle size={20} className="text-karken-green dark:text-karken-yellow" />
            <h2 className="text-lg font-black font-display text-slate-800 dark:text-white">
              {editing ? 'Modo Edición: Modificar propiedad' : 'Agregar Nueva Propiedad'}
            </h2>
          </div>
          
          <PropertyForm
            editing={editing}
            onCreated={() => {
              setEditing(null)
              load()
            }}
            onUpdated={() => {
              setEditing(null)
              load()
            }}
          />
        </div>

        {/* Listado de Propiedades */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-karken-green dark:text-karken-yellow" />
            <h2 className="text-lg font-black font-display text-slate-800 dark:text-white">
              Propiedades Publicadas ({items.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="glass-panel rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 p-4 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {p.cover_url ? (
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/50 dark:border-white/5">
                      <img src={p.cover_url} className="w-full h-full object-cover" alt={p.title} />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-xl bg-slate-200/50 dark:bg-[#0E2431]/50 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      Sin imagen de portada
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-2 leading-tight">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 w-full">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${p.operation === 'venta' ? 'bg-karken-yellow/20 text-[#a37f00] dark:text-karken-yellow' : 'bg-karken-green/20 text-karken-green dark:text-green-400'}`}>
                        {p.operation}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                        {p.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-auto bg-slate-200/30 dark:bg-white/5 px-2 py-0.5 rounded" title="Visitas totales">
                        <Eye size={12} className="text-slate-400 dark:text-slate-500" />
                        <span>{p.views || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-200/50 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border border-transparent dark:border-white/5"
                  >
                    <Edit3 size={13} />
                    <span>Editar</span>
                  </button>
                  <button
                    disabled={busyId === p.id}
                    onClick={() => remove(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-3 py-2 rounded-xl text-xs transition-all disabled:opacity-50 border border-rose-200/20 dark:border-rose-500/10 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>{busyId === p.id ? 'Borrando...' : 'Borrar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
