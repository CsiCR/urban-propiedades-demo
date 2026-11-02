import { Dispatch, SetStateAction, useState } from 'react'
import { Search, SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

export type FiltersState = {
  operation?: 'venta' | 'alquiler' | ''
  type?: 'casa' | 'departamento' | 'terreno' | 'local' | 'galpón' | 'oficina' | 'otro' | ''
  currency?: 'USD' | 'ARS' | ''
  minPrice?: string
  maxPrice?: string
}

export default function Filters({ onApply }: { onApply: Dispatch<SetStateAction<FiltersState>> }) {
  const [local, setLocal] = useState<FiltersState>({
    operation: '',
    type: '',
    currency: '',
    minPrice: '',
    maxPrice: '',
  })
  
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const onlyDigits = (v: string) => v === '' || /^\d+$/.test(v)

  const hasActiveFilters = 
    local.operation !== '' || 
    local.type !== '' || 
    local.currency !== '' || 
    local.minPrice !== '' || 
    local.maxPrice !== ''

  const handleReset = () => {
    const blank: FiltersState = {
      operation: '',
      type: '',
      currency: '',
      minPrice: '',
      maxPrice: '',
    }
    setLocal(blank)
    onApply(blank)
  }

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 shadow-xl transition-all duration-300">
      
      {/* Botón de acordeón para móviles */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full md:hidden flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 py-1 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-karken-green dark:text-karken-yellow" />
          <span>Filtros de Búsqueda</span>
          {hasActiveFilters && (
            <span className="w-2.5 h-2.5 rounded-full bg-karken-green dark:bg-karken-yellow animate-pulse" />
          )}
        </div>
        {isMobileOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Grid de Filtros (Siempre visible en md+, colapsable en móviles) */}
      <div className={`mt-3 md:mt-0 md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 ${isMobileOpen ? 'block' : 'hidden'}`}>
        
        {/* Operación */}
        <div className="flex flex-col">
          <select
            className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow transition-all"
            value={local.operation}
            onChange={e => setLocal(s => ({ ...s, operation: e.target.value as any }))}
          >
            <option value="" className="bg-white dark:bg-[#0E2431]">Operación</option>
            <option value="venta" className="bg-white dark:bg-[#0E2431]">Venta</option>
            <option value="alquiler" className="bg-white dark:bg-[#0E2431]">Alquiler</option>
          </select>
        </div>

        {/* Tipo */}
        <div className="flex flex-col">
          <select
            className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow transition-all capitalize"
            value={local.type}
            onChange={e => setLocal(s => ({ ...s, type: e.target.value as any }))}
          >
            <option value="" className="bg-white dark:bg-[#0E2431]">Inmueble</option>
            <option value="casa" className="bg-white dark:bg-[#0E2431]">Casa</option>
            <option value="departamento" className="bg-white dark:bg-[#0E2431]">Departamento</option>
            <option value="terreno" className="bg-white dark:bg-[#0E2431]">Terreno</option>
            <option value="local" className="bg-white dark:bg-[#0E2431]">Local</option>
            <option value="galpón" className="bg-white dark:bg-[#0E2431]">Galpón</option>
            <option value="oficina" className="bg-white dark:bg-[#0E2431]">Oficina</option>
            <option value="otro" className="bg-white dark:bg-[#0E2431]">Otro</option>
          </select>
        </div>

        {/* Moneda */}
        <div className="flex flex-col">
          <select
            className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow transition-all"
            value={local.currency}
            onChange={e => setLocal(s => ({ ...s, currency: e.target.value as any }))}
          >
            <option value="" className="bg-white dark:bg-[#0E2431]">Moneda</option>
            <option value="USD" className="bg-white dark:bg-[#0E2431]">USD ($)</option>
            <option value="ARS" className="bg-white dark:bg-[#0E2431]">ARS ($)</option>
          </select>
        </div>

        {/* Mínimo */}
        <div className="flex flex-col">
          <input
            className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow transition-all"
            placeholder="Min precio"
            value={local.minPrice}
            onChange={e => { const v = e.target.value; if (onlyDigits(v)) setLocal(s => ({ ...s, minPrice: v })) }}
          />
        </div>

        {/* Máximo */}
        <div className="flex flex-col">
          <input
            className="h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 px-3 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow transition-all"
            placeholder="Max precio"
            value={local.maxPrice}
            onChange={e => { const v = e.target.value; if (onlyDigits(v)) setLocal(s => ({ ...s, maxPrice: v })) }}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex-1 sm:flex-initial h-11 px-3 rounded-xl border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all flex items-center justify-center"
              title="Limpiar filtros"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            onClick={() => onApply(local)}
            className={`flex-1 h-11 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] text-sm
              ${hasActiveFilters 
                ? 'bg-karken-green dark:bg-karken-yellow text-white dark:text-[#0E2431] shadow-md shadow-karken-green/20 dark:shadow-karken-yellow/10'
                : 'bg-slate-200 dark:bg-white/5 border border-transparent dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-white/10'
              }`}
          >
            <Search size={16} />
            <span>Buscar</span>
          </button>
        </div>

      </div>
    </div>
  )
}

