import { deepClone } from '../utils/clone.js'
import { createContentHash } from '../utils/hash.js'
import { NormalizationError } from './errors.js'
import { compileSchema } from '../validators/schemaValidator.js'

export class Normalizer {
  constructor (profile) {
    if (!profile || typeof profile !== 'object') {
      throw new NormalizationError('Profile is required', { code: 'PROFILE_MISSING' })
    }
    this.profile = profile
    this.outputValidator = profile.schema ? compileSchema(profile.schema) : null
    this.inputValidator = profile.inputSchema ? compileSchema(profile.inputSchema) : null
  }

  normalize (raw, options = {}) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new NormalizationError('Metadata input must be an object', { code: 'INVALID_INPUT_TYPE' })
    }

    const opts = {
      hash: options.hash !== undefined ? options.hash : true,
      includeMeta: options.includeMeta ?? false,
      source: options.source ?? 'unspecified',
      timestamp: options.timestamp ?? new Date().toISOString()
    }

    if (this.inputValidator) {
      this.inputValidator(raw)
    }

    const state = {
      raw,
      result: this.profile.template ? deepClone(this.profile.template) : {},
      diagnostics: []
    }

    const context = {
      profile: this.profile,
      options: opts,
      addDiagnostic: (diagnostic) => {
        if (!diagnostic) return
        state.diagnostics.push({
          ...diagnostic,
          timestamp: diagnostic?.timestamp ?? opts.timestamp
        })
      }
    }

    for (const transformer of this.profile.transformers ?? []) {
      try {
        transformer(state, context)
      } catch (error) {
        throw new NormalizationError('Transformer execution failed', {
          code: 'TRANSFORMER_ERROR',
          cause: error
        })
      }
    }

    const output = deepClone(state.result)

    if (this.outputValidator) {
      this.outputValidator(output)
    }

    if (opts.hash) {
      output.hash = createContentHash({ ...output, hash: undefined })
    }

    if (opts.includeMeta) {
      output._meta = {
        profile: {
          name: this.profile.name,
          version: this.profile.version
        },
        source: opts.source,
        timestamp: opts.timestamp,
        diagnostics: state.diagnostics
      }
    }

    return output
  }
}
