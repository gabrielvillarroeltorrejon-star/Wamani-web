-- MIGRACIÓN DE BASE DE DATOS: E-COMMERCE WAMANI 2.0 (SPRINT 1)
-- Copia este script completo y pégalo en el "SQL Editor" de tu panel de Supabase y presiona "Run" (Run.
-- Este script crea las tablas maestras para soportar Carritos Multitour, Cupones y evitar el Overbooking.

-- 1. Tabla de Cupones de Descuento
CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' o 'fixed_amount'
  discount_value DECIMAL NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INT,
  current_uses INT DEFAULT 0,
  min_cart_value INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en discount_codes
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Politicas para cupones (Solo lectura pública para validarlos, inserción admin)
CREATE POLICY "Cupones visibles para todos" ON public.discount_codes FOR SELECT USING (true);

-- 2. Tabla de Tours (Catálogo Base)
-- Si ya existe una tabla de tours, asegúrate de que no choque (puedes adaptarla o usar esta nueva para V2)
CREATE TABLE IF NOT EXISTS public.tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  location_region VARCHAR(100) NOT NULL,
  base_capacity INT NOT NULL DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Tabla de Salidas / Horarios (Evita Overbooking)
CREATE TABLE IF NOT EXISTS public.tour_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  max_capacity INT NOT NULL,
  booked_seats INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- REGLA DE ORO: Evita el overbooking desde el motor de base de datos
  CONSTRAINT check_capacity CHECK (booked_seats <= max_capacity) 
);

-- 4. Tabla de Precios (Soporta distintas categorías de pasajeros)
CREATE TABLE IF NOT EXISTS public.tour_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  ticket_type VARCHAR(50) NOT NULL, -- Ej: 'adult_cl', 'child', 'foreigner'
  price_clp INT NOT NULL,
  season_start DATE, -- Null si es tarifa todo el año
  season_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Modificación a la tabla de Órdenes (Soporta múltiples items y cupones)
-- Si ya tienes una tabla `orders` o similar, considera crear esta como `orders_v2` o adaptarla.
CREATE TABLE IF NOT EXISTS public.orders_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_document VARCHAR(50), -- RUT o Pasaporte
  discount_code_id UUID REFERENCES public.discount_codes(id),
  subtotal_clp INT NOT NULL,
  discount_applied_clp INT DEFAULT 0,
  total_clp INT NOT NULL,
  payment_method VARCHAR(50), -- 'webpay', 'transfer'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  transbank_token VARCHAR(255),
  transbank_authorization_code VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Ítems de la orden (El detalle del carrito)
CREATE TABLE IF NOT EXISTS public.order_items_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders_v2(id) ON DELETE CASCADE,
  tour_schedule_id UUID REFERENCES public.tour_schedules(id),
  ticket_type VARCHAR(50) NOT NULL,
  quantity INT NOT NULL,
  snapshot_price_clp INT NOT NULL, -- El precio que se cobró en ese momento histórico
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- INSERTAR UN CUPÓN DE PRUEBA
INSERT INTO public.discount_codes (code, discount_type, discount_value, max_uses, min_cart_value) 
VALUES ('WAMANI20', 'percentage', 20, 100, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.discount_codes (code, discount_type, discount_value, max_uses, min_cart_value) 
VALUES ('10LUKAS', 'fixed_amount', 10000, 100, 50000)
ON CONFLICT (code) DO NOTHING;

-- FIN DE MIGRACIÓN.
