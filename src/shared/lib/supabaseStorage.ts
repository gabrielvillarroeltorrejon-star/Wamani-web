import { supabase, isSupabaseConfigured } from '@/shared/api/supabaseClient';
import { compressImageBlob, type CompressOptions } from './imageCompressor';

export const MEDIA_BUCKET = 'wamani_media';

let storageAvailable: boolean | null = null;

/**
 * Verifica si el bucket de almacenamiento está disponible y accesible en Supabase
 */
export async function checkStorageAvailability(): Promise<boolean> {
  if (storageAvailable !== null) return storageAvailable;
  if (!isSupabaseConfigured || !supabase) {
    storageAvailable = false;
    return false;
  }
  try {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list('', { limit: 1 });
    if (!error) {
      storageAvailable = true;
      return true;
    }
    // Si da error de bucket no encontrado o permiso denegado, marcar falso
    storageAvailable = false;
    return false;
  } catch {
    storageAvailable = false;
    return false;
  }
}

/**
 * Sube una imagen optimizada a Supabase Storage (bucket wamani_media).
 * Si el bucket aún no existe o falla la conexión, devuelve la imagen optimizada WebP/JPEG
 * para garantizar que el usuario NUNCA quede bloqueado y la imagen siempre se guarde.
 */
export async function uploadImageToStorageOrBase64(
  file: File,
  options: CompressOptions & { folder?: string } = {}
): Promise<string> {
  const { folder = 'tours', ...compressOpts } = options;

  // 1. Siempre comprimir primero del lado del cliente
  const { blob, dataUrl } = await compressImageBlob(file, compressOpts);

  // 2. Si Supabase está disponible, intentar subir al Storage público
  if (isSupabaseConfigured && supabase) {
    try {
      const isAvailable = await checkStorageAvailability();
      if (isAvailable) {
        const cleanName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const extension = blob.type.includes('webp') ? 'webp' : 'jpg';
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanName}.${extension}`;

        const { error: uploadErr } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, blob, {
            contentType: blob.type || 'image/webp',
            upsert: true
          });

        if (!uploadErr) {
          const { data: pubData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
          if (pubData?.publicUrl) {
            return pubData.publicUrl;
          }
        } else {
          console.warn('Aviso: subida a Storage falló, usando versión optimizada local:', uploadErr.message);
          storageAvailable = false;
        }
      }
    } catch (err) {
      console.warn('Aviso: excepción en Supabase Storage, usando versión optimizada:', err);
      storageAvailable = false;
    }
  }

  // Fallback seguro: dataUrl ultra-optimizado (<80KB)
  return dataUrl;
}

/**
 * Sube múltiples imágenes en paralelo
 */
export async function uploadMultipleImagesToStorage(
  files: FileList | File[],
  options: CompressOptions & { folder?: string } = {}
): Promise<string[]> {
  const fileArray = Array.from(files);
  const promises = fileArray.map(file => uploadImageToStorageOrBase64(file, options));
  return Promise.all(promises);
}
