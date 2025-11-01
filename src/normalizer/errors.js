export class NormalizationError extends Error {
  constructor (message, options = {}) {
    super(message)
    this.name = 'NormalizationError'
    this.code = options.code || 'NORMALIZATION_ERROR'
    if (options.cause) {
      this.cause = options.cause
    }
  }
}

export class ValidationError extends NormalizationError {
  constructor (message, details = [], options = {}) {
    super(message, { ...options, code: 'VALIDATION_ERROR' })
    this.name = 'ValidationError'
    this.details = details
  }
}
