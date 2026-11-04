/**
 * Script de Sincronización del Catálogo Oficial Wamani hacia Supabase
 * Ejecución: node scripts/syncSupabaseCatalog.cjs
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Cargar variables de entorno desde .env
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no configuradas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. Extraer o cargar los 29 tours oficiales
// Parseamos mockData.ts para mantener una única fuente de verdad
function loadOfficialCatalog() {
  const mockPath = path.resolve(__dirname, '../src/entities/experience/api/mockData.ts');
  const content = fs.readFileSync(mockPath, 'utf8');

  // Evaluar en sandbox o extraer el array
  const jsonLike = content
    .replace(/import type .*?;/, '')
    .replace(/export const mockExperiences: Experience\[\] =/, 'module.exports =')
    .trim();

  const tempFile = path.resolve(__dirname, '../.tmp_mockData.cjs');
  fs.writeFileSync(tempFile, jsonLike, 'utf8');

  try {
    const data = require(tempFile);
    fs.unlinkSync(tempFile);
    return data;
  } catch (err) {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    throw err;
  }
}

async function main() {
  console.log('==================================================');
  console.log('🚀 INICIANDO SINCRONIZACIÓN DE CATÁLOGO EN SUPABASE');
  console.log('URL Supabase:', supabaseUrl);
  console.log('==================================================');

  const catalog = loadOfficialCatalog();
  console.log(`Catálogo local cargado: ${catalog.length} servicios.`);

  if (catalog.length !== 29) {
    console.warn(`Alerta: Se esperaban 29 tours pero se cargaron ${catalog.length}.`);
  }

  // 1. Obtener registros existentes en Supabase
  const { data: existingRows, error: fetchErr } = await supabase
    .from('experiences')
    .select('id, title, slug');

  if (fetchErr) {
    console.error('Error al consultar tabla experiences en Supabase:', fetchErr.message);
  } else {
    console.log(`Registros actuales en Supabase: ${existingRows.length}`);

    // Detectar tours obsoletos (títulos viejos o IDs que no corresponden al catálogo actual)
    const validIds = new Set(catalog.map(t => t.id));
    const obsoleteNames = [
      'villarrica',
      'pucón',
      'pucon',
      'geysers',
      'siete lagos',
      'ruta de los lagos',
      'torres del paine',
      'glaciar el morado'
    ];

    const toDelete = existingRows.filter(row => {
      const titleLower = (row.title || '').toLowerCase();
      const isNamedObsolete = obsoleteNames.some(obs => titleLower.includes(obs));
      const isNotValidId = !validIds.has(row.id);
      return isNamedObsolete || isNotValidId;
    });

    if (toDelete.length > 0) {
      console.log(`\n🧹 Eliminando ${toDelete.length} tours obsoletos de la nube:`);
      for (const item of toDelete) {
        console.log(`   - [${item.id}] ${item.title}`);
        const { error: delErr } = await supabase
          .from('experiences')
          .delete()
          .eq('id', item.id);
        if (delErr) {
          console.error(`     Error al eliminar ${item.id}:`, delErr.message);
        }
      }
    } else {
      console.log('No se encontraron tours obsoletos por eliminar.');
    }
  }

  // 2. Mapear al esquema de Supabase y ejecutar Upsert
  console.log('\n📤 Subiendo / Actualizando los 29 tours en Supabase...');
  const rowsToUpsert = catalog.map(t => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    subtitle: t.subtitle || '',
    summary: t.summary || '',
    description: t.description || '',
    destination_id: t.destinationId,
    difficulty: t.difficulty || 'moderate',
    base_price: t.pricing.basePrice,
    cover_image: t.coverImage,
    gallery: t.gallery,
    tags: t.tags || [],
    categories: t.categories || [],
    schedule: t.schedule || null,
    meeting_point: t.meetingPoint,
    cancellation_policy: t.cancellationPolicy,
    itinerary: t.itinerary || [],
    included: t.included || [],
    not_included: t.notIncluded || [],
    status: t.status || 'active',
    updated_at: new Date().toISOString()
  }));

  const { data: upsertData, error: upsertErr } = await supabase
    .from('experiences')
    .upsert(rowsToUpsert, { onConflict: 'id' });

  if (upsertErr) {
    console.error('Error durante upsert en Supabase:', upsertErr.message);
  } else {
    console.log(`✅ Upsert completado con éxito para los ${rowsToUpsert.length} servicios.`);
  }

  // 3. Actualizar respaldo en site_content con key 'experiences_catalog'
  console.log('\n💾 Actualizando respaldo en site_content (key: experiences_catalog)...');
  const { error: siteContentErr } = await supabase
    .from('site_content')
    .upsert({
      key: 'experiences_catalog',
      data: catalog,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

  if (siteContentErr) {
    console.warn('Aviso: no se pudo actualizar site_content:', siteContentErr.message);
  } else {
    console.log('✅ Respaldo site_content actualizado correctamente.');
  }

  console.log('\n==================================================');
  console.log('🎉 SINCRONIZACIÓN FINALIZADA CON ÉXITO');
  console.log('==================================================');
}

main().catch(err => {
  console.error('Error fatal durante la sincronización:', err);
  process.exit(1);
});
