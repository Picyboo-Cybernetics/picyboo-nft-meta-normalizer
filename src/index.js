import { Normalizer } from './normalizer/Normalizer.js';
import { defaultProfile } from './profiles/defaultProfile.js';

const defaultNormalizer = new Normalizer(defaultProfile);

export function normalize(metadata, options = {}) {
  return defaultNormalizer.normalize(metadata, options);
}

export { Normalizer, defaultProfile };
