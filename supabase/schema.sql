-- ==============================================================================
-- SCHEMA OFICIAL DE SUPABASE - WAMANI EXPERIENCE
-- Ejecuta este script en el "SQL Editor" de tu proyecto en Supabase
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE EXPERIENCIAS / TOURS
CREATE TABLE IF NOT EXISTS public.experiences (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    summary TEXT,
    description TEXT,
    destination_id TEXT DEFAULT 'Pucón',
    difficulty TEXT DEFAULT 'easy',
    base_price NUMERIC NOT NULL DEFAULT 50000,
    cover_image JSONB NOT NULL DEFAULT '{"url": "", "alt": ""}',
    gallery JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    schedule TEXT,
    meeting_point TEXT,
    cancellation_policy TEXT,
    itinerary JSONB DEFAULT '[]',
    included TEXT[] DEFAULT '{}',
    not_included TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE RESERVAS Y CRM (VENTAS)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    buy_order TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_rut TEXT,
    experience_title TEXT NOT NULL,
    experience_slug TEXT,
    booking_date DATE NOT NULL,
    pax INTEGER NOT NULL DEFAULT 2,
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
    source TEXT NOT NULL DEFAULT 'automatic', -- 'automatic', 'manual'
    payment_method TEXT DEFAULT 'webpay', -- 'webpay', 'transfer', 'cash', 'manual'
    authorization_code TEXT,
    card_last4 TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE CONTENIDO GENERAL DEL SITIO (HOME, ABOUT, CONTACT, GATEWAY)
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- POLÍTICAS DE CIBERSEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Lectura pública para el catálogo y contenidos
CREATE POLICY "Permitir lectura pública de experiencias" 
ON public.experiences FOR SELECT USING (true);

CREATE POLICY "Permitir lectura pública del contenido del sitio" 
ON public.site_content FOR SELECT USING (true);

-- Permitir a clientes registrar sus reservas desde el checkout
CREATE POLICY "Permitir creación de reservas públicas" 
ON public.bookings FOR INSERT WITH CHECK (true);

-- Permitir lectura y gestión completa de reservas y contenidos a usuarios autenticados / clave anónima con control
CREATE POLICY "Permitir gestión de reservas" 
ON public.bookings FOR ALL USING (true);

CREATE POLICY "Permitir gestión de experiencias" 
ON public.experiences FOR ALL USING (true);

CREATE POLICY "Permitir gestión de contenido" 
ON public.site_content FOR ALL USING (true);

-- ==============================================================================
-- ÍNDICES PARA ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_experiences_slug ON public.experiences (slug);
CREATE INDEX IF NOT EXISTS idx_bookings_buy_order ON public.bookings (buy_order);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings (customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);
