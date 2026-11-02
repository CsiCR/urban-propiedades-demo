export default function EmptyState(){
  return (
    <div className="text-center py-16 px-6 glass-panel rounded-2xl max-w-lg mx-auto border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40">
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">No se encontraron propiedades</p>
      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Prueba cambiando los criterios de búsqueda o limpiando los filtros aplicados.</p>
    </div>
  )
}