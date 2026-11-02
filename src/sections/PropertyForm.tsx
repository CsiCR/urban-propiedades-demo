import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type Property = {
  id?: string
  title: string
  operation: 'venta'|'alquiler'
  type: 'casa'|'departamento'|'terreno'|'local'|'galpón'|'oficina'|'otro'
  bedrooms: number
  bathrooms: number
  total_m2?: number | null
  price?: number | null
  currency: 'USD'|'ARS'
  city: string
  province: string
  description?: string | null
  video_url?: string | null
}

export default function PropertyForm({
  onCreated,
  onUpdated,
  editing
}: {
  onCreated?: (id: string) => void
  onUpdated?: (id: string) => void
  editing?: Property | null
}) {
  const [id, setId] = useState<string|undefined>(undefined)
  const [title, setTitle] = useState('')
  const [operation, setOperation] = useState<'venta'|'alquiler'>('venta')
  const [type, setType] = useState<'casa'|'departamento'|'terreno'|'local'|'galpón'|'oficina'|'otro'>('casa')
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(1)
  const [totalM2, setTotalM2] = useState<number|''>('')
  const [price, setPrice] = useState<number|''>('')
  const [currency, setCurrency] = useState<'USD'|'ARS'>('USD')
  const [city, setCity] = useState('Pico Truncado')
  const [province, setProvince] = useState('Santa Cruz')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [coverFile, setCoverFile] = useState<File|null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [videoFile, setVideoFile] = useState<File|null>(null) // subir video al storage (opcional)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // poblar al editar
  useEffect(() => {
    if (editing?.id) {
      setId(editing.id)
      setTitle(editing.title || '')
      setOperation(editing.operation)
      setType(editing.type)
      setBedrooms(editing.bedrooms)
      setBathrooms(editing.bathrooms)
      setTotalM2((editing.total_m2 ?? '') as any)
      setPrice((editing.price ?? '') as any)
      setCurrency(editing.currency)
      setCity(editing.city)
      setProvince(editing.province)
      setDescription(editing.description || '')
      setVideoUrl(editing.video_url || '')
      setMsg('✏️ Modo edición')
    } else {
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id])

  function resetForm(){
    setId(undefined)
    setTitle('')
    setOperation('venta')
    setType('casa')
    setBedrooms(2)
    setBathrooms(1)
    setTotalM2('')
    setPrice('')
    setCurrency('USD')
    setCity('Pico Truncado')
    setProvince('Santa Cruz')
    setDescription('')
    setVideoUrl('')
    setCoverFile(null)
    setGalleryFiles([])
    setVideoFile(null)
    setMsg('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    try {
      let propertyId = id

      if (!propertyId) {
        // CREATE
        const { data: inserted, error } = await supabase
          .from('properties')
          .insert({
            title,
            operation,
            type,
            bedrooms,
            bathrooms,
            total_m2: totalM2 === '' ? null : Number(totalM2),
            price: price === '' ? null : Number(price),
            currency,
            city,
            province,
            description: description || null,
            video_url: videoUrl || null
          })
          .select('id')
          .single()
        if (error || !inserted) throw error || new Error('No se pudo crear la propiedad')
        propertyId = inserted.id
      } else {
        // UPDATE
        const { error } = await supabase
          .from('properties')
          .update({
            title,
            operation,
            type,
            bedrooms,
            bathrooms,
            total_m2: totalM2 === '' ? null : Number(totalM2),
            price: price === '' ? null : Number(price),
            currency,
            city,
            province,
            description: description || null,
            video_url: videoUrl || null
          })
          .eq('id', propertyId)
        if (error) throw error
      }

      // 1) Portada
      if (coverFile && propertyId) {
        await uploadCover(propertyId, coverFile)
      }

      // 2) Galería (múltiples)
      if (galleryFiles.length && propertyId) {
        await uploadGallery(propertyId, galleryFiles)
      }

      // 3) Subir archivo de video al Storage (opcional). Si se sube, actualizamos video_url
      if (videoFile && propertyId) {
        const url = await uploadVideo(propertyId, videoFile)
        if (url) {
          await supabase.from('properties').update({ video_url: url }).eq('id', propertyId)
        }
      }

      if (!id) {
        setMsg('✅ Propiedad creada')
        onCreated?.(propertyId!)
        resetForm()
      } else {
        setMsg('✅ Cambios guardados')
        onUpdated?.(propertyId!)
      }
    } catch (err: any) {
      console.error('Error al guardar:', err)
      setMsg('❌ ' + (err?.message || 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  function sanitizeName(name: string){
    return name.replace(/[^a-zA-Z0-9_.-]/g, '_')
  }

  async function uploadCover(propertyId: string, file: File){
    // Desmarcar cualquier otra portada previa para evitar duplicados
    const { error: clearErr } = await supabase
      .from('property_images')
      .update({ is_cover: false })
      .eq('property_id', propertyId)
    if (clearErr) throw clearErr

    const path = `${propertyId}/cover-${Date.now()}-${sanitizeName(file.name)}`
    const { error: upErr } = await supabase.storage.from('properties').upload(path, file, { upsert: true, cacheControl: '3600' })
    if (upErr) throw upErr
    const { data: pub } = supabase.storage.from('properties').getPublicUrl(path)
    const { error: imgErr } = await supabase
      .from('property_images')
      .insert({ property_id: propertyId, url: pub.publicUrl, is_cover: true, position: 0 })
    if (imgErr) throw imgErr
  }

  async function uploadGallery(propertyId: string, files: File[]){
    // obtener cantidad existente para continuar el índice
    const { data: exist } = await supabase
      .from('property_images')
      .select('position')
      .eq('property_id', propertyId)
      .order('position', { ascending: false })
      .limit(1)
    let start = exist?.[0]?.position != null ? Number(exist[0].position) + 1 : 0

    for (const f of files) {
      const path = `${propertyId}/gallery/${Date.now()}-${sanitizeName(f.name)}`
      const { error: upErr } = await supabase.storage.from('properties').upload(path, f, { upsert: true, cacheControl: '3600' })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('properties').getPublicUrl(path)
      const { error: imgErr } = await supabase
        .from('property_images')
        .insert({ property_id: propertyId, url: pub.publicUrl, is_cover: false, position: start++ })
      if (imgErr) throw imgErr
    }
  }

  async function uploadVideo(propertyId: string, file: File){
    const path = `${propertyId}/video/${Date.now()}-${sanitizeName(file.name)}`
    const { error: upErr } = await supabase.storage.from('properties').upload(path, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type || 'video/mp4'
    })
    if (upErr) throw upErr
    const { data: pub } = supabase.storage.from('properties').getPublicUrl(path)
    return pub.publicUrl
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      
      {/* Mensajes de feedback */}
      {msg && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold text-center ${
          msg.includes('❌') 
            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' 
            : 'bg-karken-green/10 dark:bg-karken-yellow/10 border-karken-green/20 dark:border-karken-yellow/20 text-karken-green dark:text-karken-yellow'
        }`}>
          {msg}
        </div>
      )}

      {/* Título */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Título de la propiedad</label>
        <input 
          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
          placeholder="Ej: Casa de 3 ambientes con patio amplio" 
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
          required 
        />
      </div>

      {/* Operación y Tipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo de operación</label>
          <select 
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            value={operation} 
            onChange={e=>setOperation(e.target.value as any)}
          >
            <option value="venta" className="bg-white dark:bg-[#0E2431]">Venta</option>
            <option value="alquiler" className="bg-white dark:bg-[#0E2431]">Alquiler</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo de inmueble</label>
          <select 
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all capitalize" 
            value={type} 
            onChange={e=>setType(e.target.value as any)}
          >
            <option value="casa" className="bg-white dark:bg-[#0E2431]">casa</option>
            <option value="departamento" className="bg-white dark:bg-[#0E2431]">departamento</option>
            <option value="terreno" className="bg-white dark:bg-[#0E2431]">terreno</option>
            <option value="local" className="bg-white dark:bg-[#0E2431]">local</option>
            <option value="galpón" className="bg-white dark:bg-[#0E2431]">galpón</option>
            <option value="oficina" className="bg-white dark:bg-[#0E2431]">oficina</option>
            <option value="otro" className="bg-white dark:bg-[#0E2431]">otro</option>
          </select>
        </div>
      </div>

      {/* Dormitorios y Baños */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dormitorios</label>
          <input 
            type="number" 
            min="0"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            placeholder="Ej: 3" 
            value={bedrooms} 
            onChange={e=>setBedrooms(Number(e.target.value))} 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Baños</label>
          <input 
            type="number" 
            min="0"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            placeholder="Ej: 2" 
            value={bathrooms} 
            onChange={e=>setBathrooms(Number(e.target.value))} 
          />
        </div>
      </div>

      {/* Superficie y Precio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Superficie Total (m²)</label>
          <input 
            type="number" 
            min="0"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            placeholder="Ej: 120" 
            value={totalM2 as any} 
            onChange={e=>setTotalM2(e.target.value === '' ? '' : Number(e.target.value))} 
          />
        </div>
        <div className="flex gap-2">
          <div className="w-[100px] flex-shrink-0 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Moneda</label>
            <select 
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
              value={currency} 
              onChange={e=>setCurrency(e.target.value as any)}
            >
              <option className="bg-white dark:bg-[#0E2431]">USD</option>
              <option className="bg-white dark:bg-[#0E2431]">ARS</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio</label>
            <input 
              type="number" 
              min="0"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
              placeholder="Ej: 85000" 
              value={price as any} 
              onChange={e=>setPrice(e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </div>
        </div>
      </div>

      {/* Localización */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ciudad</label>
          <input 
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            placeholder="Pico Truncado" 
            value={city} 
            onChange={e=>setCity(e.target.value)} 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provincia</label>
          <input 
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            placeholder="Santa Cruz" 
            value={province} 
            onChange={e=>setProvince(e.target.value)} 
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descripción</label>
        <textarea 
          className="w-full py-3 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all min-h-[100px]" 
          placeholder="Detalles sobre ambientes, servicios, estado general, etc..." 
          rows={4} 
          value={description} 
          onChange={e=>setDescription(e.target.value)} 
        />
      </div>

      {/* Carga de Imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-white/5 pt-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Portada (Una imagen)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e=>setCoverFile(e.target.files?.[0]||null)}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-karken-green/10 file:text-karken-green dark:file:bg-karken-yellow/10 dark:file:text-karken-yellow hover:file:opacity-90 transition-all cursor-pointer"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Galería (Múltiples imágenes)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={e=>setGalleryFiles(Array.from(e.target.files||[]))}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-karken-green/10 file:text-karken-green dark:file:bg-karken-yellow/10 dark:file:text-karken-yellow hover:file:opacity-90 transition-all cursor-pointer"
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">Las imágenes se subirán a la sección de fotos adicionales.</p>
        </div>
      </div>

      {/* Carga de Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-white/5 pt-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video URL (YouTube/Vimeo)</label>
          <input 
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0E2431]/60 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-karken-green dark:focus:ring-karken-yellow focus:border-transparent transition-all" 
            placeholder="https://www.youtube.com/watch?v=..." 
            value={videoUrl} 
            onChange={e=>setVideoUrl(e.target.value)} 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">o Subir Archivo de Video (mp4, mov)</label>
          <input 
            type="file" 
            accept="video/*" 
            onChange={e=>setVideoFile(e.target.files?.[0]||null)}
            className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-karken-green/10 file:text-karken-green dark:file:bg-karken-yellow/10 dark:file:text-karken-yellow hover:file:opacity-90 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5">
        <button 
          type="submit"
          disabled={saving} 
          className="bg-karken-green dark:bg-karken-yellow text-white dark:text-karken-dark font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? 'Guardando...' : id ? 'Guardar Cambios' : 'Guardar Propiedad'}
        </button>
        {id && (
          <button 
            type="button" 
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200/50 dark:hover:bg-white/10 transition-all text-sm cursor-pointer" 
            onClick={resetForm}
          >
            Cancelar Edición
          </button>
        )}
      </div>

    </form>
  )
}
