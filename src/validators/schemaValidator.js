import { createRequire } from 'node:module'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { ValidationError } from '../normalizer/errors.js'

const require = createRequire(import.meta.url)
const metaSchema = require('../../schemas/json-schema-2020-12/schema.json')
const metaApplicator = require('../../schemas/json-schema-2020-12/meta/applicator.json')
const metaUnevaluated = require('../../schemas/json-schema-2020-12/meta/unevaluated.json')
const metaContent = require('../../schemas/json-schema-2020-12/meta/content.json')
const metaCore = require('../../schemas/json-schema-2020-12/meta/core.json')
const metaFormat = require('../../schemas/json-schema-2020-12/meta/format-annotation.json')
const metaMetadata = require('../../schemas/json-schema-2020-12/meta/meta-data.json')
const metaValidation = require('../../schemas/json-schema-2020-12/meta/validation.json')

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: 'failing',
  strict: false,
  meta: false,
  defaultMeta: 'https://json-schema.org/draft/2020-12/schema',
  loadSchema: () => {
    throw new Error('Remote schema loading disabled')
  }
})

const metaSchemas = [
  metaSchema,
  metaApplicator,
  metaUnevaluated,
  metaContent,
  metaCore,
  metaFormat,
  metaMetadata,
  metaValidation
]

for (const schema of metaSchemas) {
  ajv.addMetaSchema(schema, undefined, false)
}

addFormats(ajv)

export function compileSchema (schema) {
  const validate = ajv.compile(schema)
  return payload => {
    const valid = validate(payload)
    if (!valid) {
      throw new ValidationError('Schema validation failed', validate.errors ?? [])
    }
    return true
  }
}
