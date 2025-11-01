import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ValidationError } from '../normalizer/errors.js';

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: 'failing',
  strict: false
});
addFormats(ajv);

export function compileSchema(schema) {
  const validate = ajv.compile(schema);
  return (payload) => {
    const valid = validate(payload);
    if (!valid) {
      throw new ValidationError('Schema validation failed', validate.errors ?? []);
    }
    return true;
  };
}
