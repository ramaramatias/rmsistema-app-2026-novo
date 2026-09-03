import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { get, put } from '@vercel/blob';

const envLocal = resolve(process.cwd(), '.env.local');
if (existsSync(envLocal)) {
  const linha = readFileSync(envLocal, 'utf8').match(/^BLOB_READ_WRITE_TOKEN=(.*)$/m);
  if (linha) process.env.BLOB_READ_WRITE_TOKEN = linha[1].trim().replace(/^["']|["']$/g, '');
}

const ARQUIVO = 'sistema-nuvem.json';
const atualGet = await get(ARQUIVO, { access: 'private', useCache: false });
if (atualGet?.statusCode === 200 && atualGet.stream) {
  const texto = await new Response(atualGet.stream).text();
  const dados = texto.trim() ? JSON.parse(texto) : {};
  const record = dados?.record && typeof dados.record === 'object' ? dados.record : dados;
  if (Array.isArray(record?.setores) && record.setores.length > 0) {
    console.log('nuvem-ok-ja-tinha-dados');
    process.exit(0);
  }
}

const backup = resolve(process.cwd(), 'backup_completo.json');
if (!existsSync(backup)) {
  console.log('nuvem-ok-vazia');
  process.exit(0);
}

const dados = JSON.parse(readFileSync(backup, 'utf8'));
await put(ARQUIVO, JSON.stringify(dados), {
  access: 'private',
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: 'application/json',
  cacheControlMaxAge: 0
});

const depois = await get(ARQUIVO, { access: 'private', useCache: false });
const texto = depois?.statusCode === 200 && depois.stream ? await new Response(depois.stream).text() : '';
const lido = texto.trim() ? JSON.parse(texto) : {};
const record = lido?.record && typeof lido.record === 'object' ? lido.record : lido;
console.log(Array.isArray(record?.setores) && record.setores.length > 0 ? 'nuvem-ok-semeada' : 'nuvem-falhou');
