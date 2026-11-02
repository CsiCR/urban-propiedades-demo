import { useEffect, useMemo, useState } from 'react'
import { Phone, Grid } from 'lucide-react'
import Filters, { FiltersState } from '../components/Filters'
import PropertyCard from '../components/PropertyCard'
import EmptyState from '../components/EmptyState'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../lib/supabaseClient'
import karkenLogo from '../assets/KarkenLogo.jpg'

const PAGE_SIZE = 8

type Property = {
  id: string
  title: string
  operation: 'venta' | 'alquiler'
  type: string
  bedrooms: number
  bathrooms: number
  total_m2?: number | null
  city: string
  province: string
  price?: number | null
  currency?: 'USD' | 'ARS'
  cover_url?: string | null
  video_url?: string | null
  created_at: string
}

export default function Catalog() {
  const [filters, setFilters] = useState<FiltersState>(() => {
    try {
      const saved = sessionStorage.getItem('karken-catalog-filters')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem('karken-catalog-page')
      return saved ? Number(saved) : 1
    } catch {
      return 1
    }
  })
  const [total, setTotal] = useState(0)

  const range = useMemo(
    () => ({ from: (page - 1) * PAGE_SIZE, to: page * PAGE_SIZE - 1 }),
    [page]
  )

  const handleApplyFilters = (newFilters: FiltersState | ((prev: FiltersState) => FiltersState)) => {
    const resolvedFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters
    setFilters(resolvedFilters)
    setPage(1)
    sessionStorage.setItem('karken-catalog-filters', JSON.stringify(resolvedFilters))
    sessionStorage.setItem('karken-catalog-page', '1')
  }

  useEffect(() => {
    sessionStorage.setItem('karken-catalog-page', page.toString())
  }, [page])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page])

  async function fetchData() {
    setLoading(true)
    let query = supabase.from('v_properties').select('*', { count: 'exact' })

    if (filters.operation) query = query.eq('operation', filters.operation)
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.currency) query = query.eq('currency', filters.currency)

    if (filters.minPrice && /^\d+$/.test(filters.minPrice)) {
      query = query.gte('price', Number(filters.minPrice))
    }
    if (filters.maxPrice && /^\d+$/.test(filters.maxPrice)) {
      query = query.lte('price', Number(filters.maxPrice))
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(range.from, range.to)

    if (error) console.error('Supabase error on Catalog:', error)
    setItems((data || []) as Property[])
    setTotal(count || 0)
    setLoading(false)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-[#0E2431] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Orbes de luz desenfocados en el fondo (Aesthetic blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-karken-green/10 dark:bg-karken-green/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-karken-yellow/10 dark:bg-karken-yellow/10 blur-[130px] pointer-events-none" />

      {/* Header pegajoso y glassmorphic */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0E2431]/70 border-b border-slate-200/50 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo y Branding */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
              <img src={karkenLogo} alt="Karken Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xl font-black tracking-wider font-display text-karken-dark dark:text-white leading-none">KARKEN</div>
              <div className="text-[10px] font-bold text-karken-green dark:text-karken-yellow tracking-widest mt-1">INMOBILIARIA</div>
            </div>
          </div>

          {/* Selector de Tema y Botón de WhatsApp */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://wa.me/5492974053219"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold text-white bg-karken-green hover:bg-[#1a4a25] px-4 py-2.5 rounded-xl shadow-md shadow-karken-green/20 hover:shadow-lg hover:shadow-karken-green/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
            >
              <Phone size={16} className="animate-pulse" />
              <span className="hidden sm:inline">Escribinos por WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 border-b border-slate-200/50 dark:border-white/5">
        {/* Patrón de Rejilla de Fondo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="px-3 py-1 text-xs font-extrabold tracking-widest text-karken-green dark:text-karken-yellow bg-karken-green/10 dark:bg-karken-yellow/10 rounded-full uppercase">
            Encontrá tu próximo hogar
          </span>
          <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight font-display">
            Catálogo de{' '}
            <span className="bg-gradient-to-r from-karken-green via-karken-green to-[#2e7d3e] dark:from-karken-yellow dark:via-white dark:to-karken-green bg-clip-text text-transparent">
              Inmuebles
            </span>
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Propiedades seleccionadas en Santa Cruz con atención personalizada y transparencia garantizada.
          </p>
          
          {/* Panel de Filtros */}
          <div className="mt-10 max-w-5xl mx-auto">
            <Filters onApply={handleApplyFilters} />
          </div>
        </div>
      </section>

      {/* Grid de Propiedades */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        <div className="flex items-center gap-2 mb-6">
          <Grid size={18} className="text-karken-green dark:text-karken-yellow" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {loading ? 'Buscando inmuebles...' : `${total} ${total === 1 ? 'Propiedad encontrada' : 'Propiedades encontradas'}`}
          </h2>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-karken-green border-t-transparent rounded-full animate-spin dark:border-karken-yellow dark:border-t-transparent mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando catálogo inmobiliario...</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        )}

        {/* Paginación Glassmorphic */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-white/10 glass-panel bg-white/40 dark:bg-[#0E2431]/40 disabled:opacity-40 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:border-karken-green/40 dark:hover:border-karken-yellow/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:pointer-events-none"
            >
              Anterior
            </button>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Página <span className="text-slate-900 dark:text-white font-extrabold">{page}</span> de <span className="font-extrabold">{totalPages}</span>
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-white/10 glass-panel bg-white/40 dark:bg-[#0E2431]/40 disabled:opacity-40 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:border-karken-green/40 dark:hover:border-karken-yellow/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:pointer-events-none"
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-200/50 dark:border-white/5 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
        <p>© {new Date().getFullYear()} Karken Inmobiliaria. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

