import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, BedDouble, Bath, Ruler, MapPin, Phone, Share2, AlertCircle } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import karkenLogo from '../assets/KarkenLogo.jpg'

const ReactPlayer = lazy(() => import('react-player'))

function formatMoney(v?: number | null, currency?: string) {
  if (v == null) return 'Consultar precio'
  const n = Number(v)
  return `${currency || 'USD'} ${new Intl.NumberFormat('es-AR').format(n)}`
}

type Property = {
  id: string
  title: string
  description: string | null
  operation: 'venta' | 'alquiler'
  type: string
  bedrooms: number
  bathrooms: number
  total_m2?: number | null
  covered_m2?: number | null
  city: string
  province: string
  address?: string | null
  price?: number | null
  currency?: 'USD' | 'ARS'
  created_at: string
  video_url?: string | null
}

type Img = { id: number; url: string; is_cover: boolean; position?: number | null }

function isDirectVideo(url?: string | null) {
  if (!url) return false
  const u = url.toLowerCase()
  return (
    u.includes('.supabase.co/storage/v1/object/') ||
    /\.(mp4|webm|mov|m4v|ogg)$/.test(u)
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prop, setProp] = useState<Property | null>(null)
  const [imgs, setImgs] = useState<Img[]>([])
  const [active, setActive] = useState(0)
  const [shared, setShared] = useState(false)
  const [loading, setLoading] = useState(true)

  const whats = useMemo(() => {
    const base = 'https://wa.me/5492974053219'
    const url = `${window.location.origin}${window.location.hash}`
    const txt = `¡Hola! Me interesa la propiedad que vi en el catálogo web:
🏡 *${prop?.title}*
📍 ${prop?.city}, ${prop?.province}
💰 *${formatMoney(prop?.price, prop?.currency)}*
🔗 Enlace: ${url}`
    return `${base}?text=${encodeURIComponent(txt)}`
  }, [prop])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const { data: p, error: pErr } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()
      
      if (pErr) {
        console.error("Error al cargar la propiedad:", pErr)
      }
      
      if (!pErr && p) {
        setProp(p as Property)
        supabase.rpc('increment_property_views', { property_id: id }).then(({ error }) => {
          if (error) console.error("Error al incrementar visitas:", error)
        })
      }


      const { data: i, error: iErr } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('is_cover', { ascending: false })
        .order('position', { ascending: true })
        .order('id', { ascending: true })

      if (iErr) {
        console.error("Error al cargar imágenes de la propiedad:", iErr)
      }

      setImgs((i as Img[]) || [])
      setActive(0)
    } catch (err) {
      console.error("Excepción en load():", err)
    } finally {
      setLoading(false)
    }
  }


  const handleShare = () => {
    const url = `${window.location.origin}/${window.location.hash}`
    navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E2431] flex flex-col justify-center items-center text-slate-500 dark:text-slate-400">
        <div className="w-10 h-10 border-4 border-karken-green border-t-transparent rounded-full animate-spin dark:border-karken-yellow dark:border-t-transparent mb-4" />
        <p className="font-semibold text-sm">Cargando detalles de propiedad...</p>
      </div>
    )
  }

  if (!prop) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E2431] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6">
        <AlertCircle size={48} className="text-rose-500 mb-4" />
        <p className="text-xl font-bold mb-2">Propiedad no encontrada</p>
        <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-sm">No pudimos cargar la propiedad solicitada o no existe en la base de datos.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-karken-green text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#1a4a25] transition-all">
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E2431] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden pb-20">
      
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-karken-green/10 dark:bg-karken-green/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-karken-yellow/10 dark:bg-karken-yellow/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-[#0E2431]/70 border-b border-slate-200/50 dark:border-white/5 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner">
              <img src={karkenLogo} alt="Karken Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-lg font-black tracking-wider font-display text-karken-dark dark:text-white leading-none">KARKEN</div>
              <div className="text-[9px] font-bold text-karken-green dark:text-karken-yellow tracking-widest mt-1">INMOBILIARIA</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1)
                } else {
                  navigate('/')
                }
              }}
              className="inline-flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-white/5 px-3.5 py-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all text-xs sm:text-sm cursor-pointer bg-transparent"
            >
              <ArrowLeft size={15} />
              <span>Volver</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200/50 dark:border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded uppercase ${prop.operation === 'venta' ? 'bg-karken-yellow text-karken-dark' : 'bg-karken-green text-white'}`}>
                {prop.operation}
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase">
                {prop.type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3.5xl font-black font-display text-slate-800 dark:text-white leading-tight">
              {prop.title}
            </h1>
            <div className="mt-2.5 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm font-semibold">
              <MapPin size={16} className="text-karken-green dark:text-karken-yellow" />
              <span>{prop.city}, {prop.province} {prop.address ? `· ${prop.address}` : ''}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 transition-all text-sm shadow-sm cursor-pointer
                ${shared 
                  ? 'bg-karken-green text-white border-karken-green' 
                  : 'bg-white/40 dark:bg-[#0E2431]/40 hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200'}`}
            >
              <Share2 size={16} />
              <span>{shared ? '¡Enlace copiado!' : 'Compartir'}</span>
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            
            <div className="space-y-3">
              <div className="w-full aspect-[16/10] bg-slate-200/50 dark:bg-[#0E2431]/50 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 relative group shadow-md">
                {imgs.length > 0 ? (
                  imgs[active] ? (
                    <img 
                      src={imgs[active].url} 
                      alt={prop.title} 
                      className="w-full h-full object-cover transition-all duration-300" 
                    />
                  ) : null
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/30">
                    <span className="text-sm font-semibold">Sin imágenes disponibles</span>
                  </div>
                )}

              </div>
              
              {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {imgs.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActive(idx)}
                      className={`relative flex-shrink-0 h-16 w-24 rounded-xl overflow-hidden border-2 transition-all shadow-sm ${idx === active ? 'border-karken-green dark:border-karken-yellow ring-2 ring-karken-green/20 dark:ring-karken-yellow/20 scale-[0.98]' : 'border-transparent hover:opacity-90'}`}
                      title={`Ver foto ${idx + 1}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt={`Minis ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-700 dark:text-slate-200 shadow-sm font-semibold">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 text-karken-green dark:text-karken-yellow">
                  <BedDouble size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Dormitorios</div>
                  <div className="text-sm sm:text-base mt-1">{prop.bedrooms} dorm.</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 text-karken-green dark:text-karken-yellow">
                  <Bath size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Baños</div>
                  <div className="text-sm sm:text-base mt-1">{prop.bathrooms} baños</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 text-karken-green dark:text-karken-yellow">
                  <Ruler size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Sup. Total</div>
                  <div className="text-sm sm:text-base mt-1">{prop.total_m2 ? `${Number(prop.total_m2)} m²` : '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-200/50 dark:bg-white/5 text-karken-green dark:text-karken-yellow">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase leading-none">Localidad</div>
                  <div className="text-sm sm:text-base mt-1 truncate">{prop.city}</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 space-y-4 shadow-sm">
              <h2 className="text-xl font-black font-display text-slate-800 dark:text-white pb-3 border-b border-slate-200/50 dark:border-white/5">
                Descripción
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-medium">
                {prop.description || 'Esta propiedad no tiene una descripción detallada provista por el administrador.'}
              </p>
            </div>

            {prop.video_url && (
              <div id="video" className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#0E2431]/40 space-y-4 shadow-sm">
                <h2 className="text-xl font-black font-display text-slate-800 dark:text-white pb-3 border-b border-slate-200/50 dark:border-white/5">
                  Video Presentación
                </h2>
                
                <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200/50 dark:border-white/5 shadow-inner">
                  {isDirectVideo(prop.video_url) ? (
                    <video
                      src={prop.video_url}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full"
                    />
                  ) : (
                    <Suspense fallback={<div className="w-full h-full grid place-items-center text-slate-500 font-medium">Cargando reproductor...</div>}>
                      <ReactPlayer 
                        url={prop.video_url} 
                        width="100%" 
                        height="100%" 
                        controls 
                        playing={false} 
                      />
                    </Suspense>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-[#0E2431]/60 shadow-xl space-y-6 text-center lg:text-left">
              <div>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Valor de la propiedad</span>
                <div className="text-3xl font-black font-display text-karken-green dark:text-karken-yellow mt-1">
                  {formatMoney(prop.price, prop.currency)}
                </div>
                {prop.price && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 block">
                    Sujeto a cambios del mercado inmobiliario.
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200/50 dark:border-white/5 space-y-4">
                <a
                  href={whats}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-karken-green hover:bg-[#1a4a25] text-white font-bold px-4 py-3.5 rounded-xl shadow-lg shadow-karken-green/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
                >
                  <Phone size={18} className="fill-current" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>

              <div className="pt-4 text-xs text-slate-400 dark:text-slate-500 space-y-2 leading-relaxed">
                <p className="font-semibold text-slate-500 dark:text-slate-400">Atención personalizada:</p>
                <p>Nuestros asesores responderán tus consultas de manera inmediata vía WhatsApp de Lunes a Sábados.</p>
                <div className="p-3 bg-slate-200/50 dark:bg-white/5 rounded-xl text-center border border-slate-200/20">
                  Ref de Propiedad: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{prop.id.substring(0,8).toUpperCase()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
