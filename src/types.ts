export type PropertyImage = {
  id: number
  url: string
  is_cover: boolean
  position?: number | null
}

export type Property = {
  id: string
  title: string
  description: string | null
  operation: 'venta' | 'alquiler'
  type: 'casa' | 'departamento' | 'terreno' | 'local' | 'galpón' | 'oficina' | 'otro'
  bedrooms: number
  bathrooms: number
  covered_m2: number | null
  total_m2: number | null
  price: number | null
  currency: string
  city: string
  province: string
  address: string | null
  featured: boolean
  created_at: string
  cover_url?: string | null
  video_url?: string | null
  images?: PropertyImage[]
}
