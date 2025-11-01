import normalizedSchema from '../schemas/normalized-metadata.schema.json' assert { type: 'json' };
import rawSchema from '../schemas/raw-metadata.schema.json' assert { type: 'json' };
import { attributesTransformer } from '../transformers/attributes.js';
import { coreFieldsTransformer } from '../transformers/coreFields.js';

export const defaultProfile = {
  name: 'default',
  version: '2024.03',
  description: 'Baseline ERC-721/1155 metadata normalization pipeline.',
  inputSchema: rawSchema,
  schema: normalizedSchema,
  template: {
    name: '',
    description: '',
    image: '',
    attributes: []
  },
  transformers: [coreFieldsTransformer, attributesTransformer]
};
