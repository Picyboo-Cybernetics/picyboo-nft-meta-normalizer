#!/usr/bin/env node
import { program } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import fetch from 'node-fetch';
import YAML from 'yaml';
import { Normalizer, defaultProfile } from '../src/index.js';

const VERSION = '0.2.0';

program
  .name('pbnft')
  .description('PICYBOO NFT metadata normalizer (proof-of-use tooling)')
  .version(VERSION);

program
  .command('normalize')
  .argument('[inputs...]', 'File or directory paths containing JSON metadata records.')
  .option('-o, --output <destination>', 'Write normalized documents to file or directory.')
  .option('-f, --format <format>', 'Output format: json or yaml', 'json')
  .option('--profile <name>', 'Normalization profile (default only).', 'default')
  .option('--no-hash', 'Disable SHA-256 content hash generation.')
  .option('--include-meta', 'Attach execution metadata to the output payload.')
  .option('--validate-only', 'Run transformation and validation without writing output.')
  .option('--fetch <url>', 'Fetch a single metadata document from a URL.')
  .option('--stdin', 'Read one metadata document from stdin.')
  .option('--quiet', 'Suppress summary logs.')
  .action(async (inputs, options) => {
    try {
      if (options.profile !== 'default') {
        throw new Error(`Unsupported profile: ${options.profile}`);
      }

      const format = (options.format || 'json').toLowerCase();
      if (!['json', 'yaml'].includes(format)) {
        throw new Error(`Unsupported format: ${options.format}`);
      }

      const documents = [];

      if (options.stdin) {
        documents.push({
          id: 'stdin',
          source: 'stdin',
          payload: await readStdin()
        });
      }

      if (options.fetch) {
        documents.push({
          id: options.fetch,
          source: options.fetch,
          payload: await readRemote(options.fetch)
        });
      }

      for (const input of inputs) {
        const resolved = path.resolve(process.cwd(), input);
        const stats = await statSafe(resolved);
        if (!stats) {
          throw new Error(`Input not found: ${input}`);
        }
        if (stats.isDirectory()) {
          const files = await enumerateJsonFiles(resolved);
          for (const file of files) {
            documents.push({
              id: file,
              source: file,
              payload: await readJson(file)
            });
          }
        } else {
          documents.push({
            id: resolved,
            source: resolved,
            payload: await readJson(resolved)
          });
        }
      }

      if (documents.length === 0) {
        throw new Error('No input documents supplied.');
      }

      const normalizer = new Normalizer(defaultProfile);
      const outputs = [];
      const failures = [];

      for (const document of documents) {
        try {
          const normalized = normalizer.normalize(document.payload, {
            hash: options.hash,
            includeMeta: options.includeMeta,
            source: document.source
          });
          outputs.push({ ...document, normalized });
        } catch (error) {
          failures.push({ document, error });
        }
      }

      if (!options.validateOnly) {
        await writeOutputs(outputs, { ...options, format });
      }

      if (!options.quiet) {
        logSummary(outputs, failures, options.validateOnly);
      }

      if (failures.length > 0) {
        process.exitCode = 1;
        failures.forEach(({ document, error }) => {
          console.error(`\n[error] ${document.source}`);
          console.error(error.message);
          if (error.details) {
            console.error(JSON.stringify(error.details, null, 2));
          }
        });
      } else if (outputs.length && options.validateOnly) {
        outputs.forEach(({ normalized }) => {
          process.stdout.write(serialize(normalized, format));
        });
      }
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  });

program.parseAsync().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

async function enumerateJsonFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function statSafe(p) {
  try {
    return await fs.stat(p);
  } catch (error) {
    return null;
  }
}

async function readStdin() {
  const chunks = [];
  return new Promise((resolve, reject) => {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(chunks.join('')));
      } catch (error) {
        reject(error);
      }
    });
    process.stdin.on('error', reject);
  });
}

async function readRemote(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function writeOutputs(outputs, options) {
  if (outputs.length === 0) {
    return;
  }

  if (!options.output) {
    outputs.forEach(({ normalized }, index) => {
      const serialized = serialize(normalized, options.format);
      process.stdout.write(serialized);
      if (index < outputs.length - 1) {
        process.stdout.write('\n');
      }
    });
    return;
  }

  const destination = path.resolve(process.cwd(), options.output);
  if (outputs.length > 1) {
    await fs.mkdir(destination, { recursive: true });
    await Promise.all(
      outputs.map(async ({ normalized, source }) => {
        const filename = path.basename(source, path.extname(source)) || 'normalized';
        const serialized = serialize(normalized, options.format);
        const ext = options.format === 'yaml' ? '.yml' : '.json';
        const target = path.join(destination, `${filename}${ext}`);
        await fs.writeFile(target, serialized, 'utf8');
      })
    );
  } else {
    const serialized = serialize(outputs[0].normalized, options.format);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, serialized, 'utf8');
  }
}

function serialize(payload, format) {
  if (format === 'yaml') {
    return `${YAML.stringify(payload).trim()}\n`;
  }
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function logSummary(outputs, failures, validateOnly) {
  const total = outputs.length + failures.length;
  const summaryParts = [`Processed: ${total}`];
  summaryParts.push(`normalized: ${outputs.length}`);
  summaryParts.push(`failed: ${failures.length}`);
  if (validateOnly) {
    summaryParts.push('(validate only)');
  }
  console.error(summaryParts.join(' | '));
}
