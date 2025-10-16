#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync } from 'fs';
import { normalize } from '../src/index.js';

program.name('pbnft').description('PICYBOO NFT metadata normalizer').version('0.1.0');

program.command('normalize')
  .argument('<path>')
  .action((path)=>{
    const raw = readFileSync(path, 'utf8');
    const meta = JSON.parse(raw);
    const out = normalize(meta);
    console.log(JSON.stringify(out, null, 2));
  });

program.parse();
