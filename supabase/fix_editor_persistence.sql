-- ==============================================================================
-- SQL DE OPTIMIZACIÓN Y PERSISTENCIA DEFINITIVA - WAMANI EXPERIENCE
-- Ejecuta este script en el "SQL Editor" de tu proyecto en Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. CREAR EL BUCKET PÚBLICO DE ALMACENAMIENTO (STORAGE) PARA FOTOS Y MEDIOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('wamani_media', 'wamani_media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. POLÍTICAS DE ACCESO PARA EL BUCKET 'wamani_media'
-- Permitir lectura pública de imágenes a todos los visitantes
DROP POLICY IF EXISTS "Lectura pública de wamani_media" ON storage.objects;
CREATE POLICY "Lectura pública de wamani_media"
ON storage.objects FOR SELECT
USING (bucket_id = 'wamani_media');

-- Permitir subir fotos desde el panel de administración (clave anónima o autenticada)
DROP POLICY IF EXISTS "Subida a wamani_media" ON storage.objects;
CREATE POLICY "Subida a wamani_media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wamani_media');

-- Permitir actualizar o reemplazar imágenes en el bucket
DROP POLICY IF EXISTS "Actualización en wamani_media" ON storage.objects;
CREATE POLICY "Actualización en wamani_media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'wamani_media');

-- Permitir eliminar fotos de tours cuando se elimine la imagen
DROP POLICY IF EXISTS "Eliminación en wamani_media" ON storage.objects;
CREATE POLICY "Eliminación en wamani_media"
ON storage.objects FOR DELETE
USING (bucket_id = 'wamani_media');


-- 3. ENRIQUECER LA TABLA EXPERIENCIAS CON COLUMNAS ADICIONALES
-- Esto permite que todas las columnas nativas de tours también se guarden de forma relacional
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS macro_zone TEXT DEFAULT 'centro';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{"Español","Inglés"}';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS hero_banner_url TEXT;
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS duration JSONB DEFAULT '{"value": 8, "unit": "hours"}';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS capacity JSONB DEFAULT '{"min": 2, "max": 12}';
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS guarantees TEXT[] DEFAULT '{}';

-- 4. REAFIRMAR POLÍTICAS DE LECTURA Y ESCRITURA EN TABLAS PÚBLICAS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir gestión de experiencias" ON public.experiences;
CREATE POLICY "Permitir gestión de experiencias" 
ON public.experiences FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir gestión de contenido" ON public.site_content;
CREATE POLICY "Permitir gestión de contenido" 
ON public.site_content FOR ALL USING (true);

-- NOTA: Una vez ejecutado este script, el sistema subirá automáticamente todas las fotos
-- a la CDN pública de Supabase Storage (https://ugclzacrwikktuulamhf.supabase.co/storage/v1/object/public/wamani_media/...),
-- haciendo la carga del sitio ultrarrápida y permitiendo miles de fotos sin límites.
