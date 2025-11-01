const CORE_MAPPINGS = {
  name: ['name', 'title'],
  description: ['description', 'details', 'summary'],
  image: ['image', 'image_url', 'imageUrl', 'imageURI'],
  animation_url: ['animation_url', 'animationUrl', 'animationURI'],
  external_url: ['external_url', 'externalUrl']
}

export function coreFieldsTransformer (state, context) {
  const { raw, result } = state
  for (const [target, candidates] of Object.entries(CORE_MAPPINGS)) {
    const value = pickString(raw, candidates)
    if (value !== undefined) {
      result[target] = value
      context.addDiagnostic({
        level: 'info',
        message: `Mapped ${target}`,
        path: candidates.find((key) => hasKey(raw, key)) ?? target
      })
    }
  }

  result.name ??= ''
  result.description ??= ''
  result.image ??= ''
  result.attributes ??= []
}

function pickString (source, keys) {
  for (const key of keys) {
    if (!hasKey(source, key)) continue
    const value = source[key]
    if (value === null || value === undefined) continue
    if (typeof value === 'string') {
      return value.trim()
    }
  }
  return undefined
}

function hasKey (source, key) {
  return Object.prototype.hasOwnProperty.call(source, key)
}
