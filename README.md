# PICYBOO NFT Metadata Normalizer

Tooling used to demonstrate how PICYBOO normalizes ERC-721/1155 style metadata for proof-of-use purposes. The repository is intentionally scoped to the normalizer layer and does not expose product internals.

## Contents
- [Getting started](#getting-started)
- [CLI usage](#cli-usage)
- [Normalization workflow](#normalization-workflow)
- [Schema](#schema)
- [Examples](#examples)
- [Quality gates](#quality-gates)
- [Status](#status)

## Getting started
```bash
npm install
npm run lint
npm test
```

Link the CLI locally if required:
```bash
npm link
pbnft --help
```

## CLI usage
The CLI accepts single files, directories (recursively enumerated for `.json` files), stdin, or a remote URL. Output can be written as JSON or YAML.

```bash
# Normalize a single file and print to stdout
pbnft normalize examples/sample.json

# Normalize multiple files into a directory as YAML
pbnft normalize examples --output ./out --format yaml

# Fetch metadata from a URL, include diagnostics metadata, and validate only
pbnft normalize --fetch https://example.invalid/meta.json --include-meta --validate-only
```

Key options:

| Option | Description |
| --- | --- |
| `--no-hash` | Skip SHA-256 content hashing. |
| `--include-meta` | Attach profile information and diagnostics under `_meta`. |
| `--validate-only` | Run the pipeline without writing files. |
| `--stdin` | Read a single document from stdin. |
| `--fetch <url>` | Fetch a document from a remote endpoint. |

CLI exit codes follow Unix conventions (0 on success, non-zero when at least one document fails validation).

## Normalization workflow
The normalizer executes a modular pipeline:

1. **Input validation** – incoming payloads are checked against `raw-metadata.schema.json` using AJV.
2. **Core field mapping** – common aliases such as `image_url` or `title` are mapped onto the canonical schema.
3. **Attribute normalization** – attributes are coerced into a consistent array of `{ trait_type, value, display_type }` objects.
4. **Schema validation** – the resulting document must satisfy `normalized-metadata.schema.json`.
5. **Hashing (optional)** – a SHA-256 hash is generated over the normalized content unless disabled.

Transformers emit diagnostics that can be inspected by enabling `--include-meta`.

## Schema
Normalized payloads conform to [`src/schemas/normalized-metadata.schema.json`](src/schemas/normalized-metadata.schema.json). The essential structure is:

```json
{
  "name": "",
  "description": "",
  "image": "",
  "attributes": [
    {
      "trait_type": "",
      "value": "",
      "display_type": ""
    }
  ],
  "hash": "",
  "_meta": {
    "profile": { "name": "", "version": "" },
    "source": "",
    "timestamp": "",
    "diagnostics": []
  }
}
```

## Examples
Example payloads representing different input styles are located in [`examples/`](examples/):

- `sample.json` – minimal single asset.
- `erc721-opensea.json` – marketplace style payload with direct attributes array.
- `erc1155-enjin.json` – object-based attribute map conversion.
- `invalid.json` – intentionally malformed for negative testing.

Run `pbnft normalize examples --output ./normalized` to produce normalized outputs for all samples.

## Quality gates
Automated checks ensure the pipeline stays reproducible:

- `npm run lint` – ESLint (Standard config) for consistent code style.
- `npm test` – Vitest unit tests covering the default profile and edge cases.
- `.github/workflows/normalize.yml` – optional CI hook that runs linting and tests (see workflow file).

## Status
This repository is maintained as a narrow proof-of-use artifact. It captures the normalization approach without revealing broader product functionality. Contributions are limited to keeping the demonstration reproducible and accurate.

© Picyboo Cybernetics. MIT License.
