import { createHash } from 'crypto';

export function normalize(meta){
  const get = (k, def='') => (meta && typeof meta[k] !== 'undefined') ? meta[k] : def;
  const out = {
    name: get('name'),
    description: get('description'),
    image: get('image') || get('image_url') || '',
    attributes: Array.isArray(meta?.attributes) ? meta.attributes : [],
  };
  const hash = createHash('sha256').update(JSON.stringify(out)).digest('hex');
  return { ...out, hash };
}
