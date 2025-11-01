export function attributesTransformer(state, context) {
  const rawAttributes = state.raw.attributes;
  const normalized = [];

  if (Array.isArray(rawAttributes)) {
    for (const entry of rawAttributes) {
      const transformed = normalizeAttributeEntry(entry);
      if (transformed) {
        normalized.push(transformed);
      }
    }
  } else if (rawAttributes && typeof rawAttributes === 'object') {
    for (const [trait, value] of Object.entries(rawAttributes)) {
      const transformed = normalizeAttributeEntry({ trait_type: trait, value });
      if (transformed) {
        normalized.push(transformed);
      }
    }
    context.addDiagnostic({
      level: 'info',
      message: 'Converted object attributes to array',
      path: 'attributes'
    });
  }

  state.result.attributes = normalized;

  if (normalized.length === 0) {
    context.addDiagnostic({
      level: 'warning',
      message: 'No attribute entries detected',
      path: 'attributes'
    });
  }
}

function normalizeAttributeEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  const trait = pickValue(entry, ['trait_type', 'traitType', 'trait']);
  const value = entry.value ?? entry.val ?? entry.display_value ?? null;
  if (trait === undefined || value === null || value === undefined) {
    return null;
  }
  const normalized = {
    trait_type: String(trait).trim(),
    value: coerceValue(value)
  };
  const displayType = pickValue(entry, ['display_type', 'displayType']);
  if (displayType !== undefined) {
    normalized.display_type = String(displayType);
  }
  return normalized;
}

function pickValue(entry, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(entry, key)) {
      return entry[key];
    }
  }
  return undefined;
}

function coerceValue(value) {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
