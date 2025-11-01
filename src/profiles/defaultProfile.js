import { createRequire } from 'node:module'
import { attributesTransformer } from '../transformers/attributes.js'
import { coreFieldsTransformer } from '../transformers/coreFields.js'

const require = createRequire(import.meta.url)
const normalizedSchema = require('../schemas/normalized-metadata.schema.json')
const rawSchema = require('../schemas/raw-metadata.schema.json')

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
}
