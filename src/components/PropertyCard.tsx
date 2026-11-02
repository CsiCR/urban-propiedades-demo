import { BedDouble, Bath, Ruler, MapPin, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = {
  p: {
    id: string
    title: string
    operation: 'venta' | 'alquiler'
    bedrooms: number
    bathrooms: number
    total_m2?: number | null
    city: string
    province: string
    price?: number | null
    currency?: string
    cover_url?: string | null
    video_url?: string | null
  }
}

function formatMoney(v?: number | null, currency?: string) {
  if (v == null) return 'Consultar precio'
  const n = Number(v)
  return `${currency || 'USD'} ${new Intl.NumberFormat('es-AR').format(n)}`
}

function isDirectVideo(url?: string | null) {
  if (!url) return false
  const u = url.toLowerCase()
  return u.includes('.supabase.co/storage/v1/object/') || /\.(mp4|webm|mov|m4v|ogg)$/.test(u)
}

export default function PropertyCard({ p }: Props) {
  const externalVideo = p.video_url && !isDirectVideo(p.video_url)
  const detailVideoHref = `#/propiedad/${p.id}#video`
  
  // Opciones de brillo según la operación (Venta: Amarillo Karken, Alquiler: Verde Karken)
  const glowClass = p.operation === 'venta' ? 'glow-yellow' : 'glow-green'

  return (
    <article className={`group relative rounded-2xl overflow-hidden glass-panel ${glowClass} border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 flex flex-col h-full shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-300`}>
      
      {/* Portada / Imagen */}
      <Link to={`/propiedad/${p.id}`} className="block relative aspect-[4/3] overflow-hidden">
        {p.cover_url ? (
          <img 
            src={p.cover_url} 
            alt={p.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-[#0E2431]/60 flex items-center justify-center text-slate-400 text-sm font-semibold">
            Sin imagen
          </div>
        )}
        
        {/* Badges sobre la imagen */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {p.operation === 'venta' ? (
            <span className="bg-karken-yellow text-karken-dark text-[10px] font-black tracking-widest px-3 py-1 rounded-lg uppercase shadow-sm">
              Venta
            </span>
          ) : (
            <span className="bg-karken-green text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-lg uppercase shadow-sm">
              Alquiler
            </span>
          )}
        </div>

        {p.video_url && (
          <span className="absolute top-3 right-3 backdrop-blur-md bg-black/60 border border-white/10 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Play size={10} className="fill-white" />
            <span>VIDEO</span>
          </span>
        )}

        {/* Gradiente sutil inferior sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative z-10">
        <div className="space-y-2">
          {/* Título de la propiedad */}
          <Link to={`/propiedad/${p.id}`} className="block">
            <h3 className="text-lg font-black font-display text-slate-800 dark:text-white group-hover:text-karken-green dark:group-hover:text-karken-yellow transition-colors duration-300 leading-snug line-clamp-2">
              {p.title}
            </h3>
          </Link>

          {/* Precio */}
          <div className="text-lg font-black text-karken-green dark:text-karken-yellow font-display">
            {formatMoney(p.price, p.currency)}
          </div>
          
          {/* Ubicación */}
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold">
            <MapPin size={14} className="text-slate-300 dark:text-slate-600" />
            <span className="line-clamp-1">{p.city}, {p.province}</span>
          </div>
        </div>

        {/* Especificaciones e Iconos */}
        <div className="pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3.5 text-slate-500 dark:text-slate-400 text-xs font-bold">
            <div className="flex items-center gap-1" title="Dormitorios">
              <BedDouble size={15} className="text-slate-400 dark:text-slate-600" /> 
              <span>{p.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1" title="Baños">
              <Bath size={15} className="text-slate-400 dark:text-slate-600" /> 
              <span>{p.bathrooms}</span>
            </div>
            {!!p.total_m2 && (
              <div className="flex items-center gap-1" title="Superficie total">
                <Ruler size={15} className="text-slate-400 dark:text-slate-600" /> 
                <span>{Number(p.total_m2)} m²</span>
              </div>
            )}
          </div>

          {/* Botón de reproducción de video */}
          {p.video_url && (
            externalVideo ? (
              <a
                href={p.video_url!}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/10 text-karken-green dark:text-karken-yellow transition-all"
                title="Ver video externo"
              >
                <Play size={14} className="fill-current" />
              </a>
            ) : (
              <a
                href={detailVideoHref}
                className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/10 text-karken-green dark:text-karken-yellow transition-all"
                title="Ver video de la propiedad"
              >
                <Play size={14} className="fill-current" />
              </a>
            )
          )}
        </div>
      </div>
    </article>
  )
}

