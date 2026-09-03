import fs from 'fs';
import path from 'path';

const root = path.resolve('c:/Users/Ramara/meu-sistema-gestao');
const srcPath = path.join(root, 'src/App.tsx');
const backupPath = path.join(root, 'src/backup/App.completo.tsx');
const text = fs.readFileSync(backupPath, 'utf8');
fs.writeFileSync(srcPath, text);
const nl = text.includes('\r\n') ? '\r\n' : '\n';
const lines = text.split(/\r?\n/);

const abasDir = path.join(root, 'src/abas');
fs.mkdirSync(abasDir, { recursive: true });

const tabs = [
  { file: 'AbaPendencias.tsx', name: 'AbaPendencias', start: 4193, end: 4361, aba: 'pendencias' },
  { file: 'AbaManutencao.tsx', name: 'AbaManutencao', start: 4363, end: 4495, aba: 'manutencao' },
  { file: 'AbaCotacao.tsx', name: 'AbaCotacao', start: 4497, end: 4821, aba: 'cotacao' },
  { file: 'AbaPagamentos.tsx', name: 'AbaPagamentos', start: 4823, end: 4953, aba: 'pagamentos' },
  { file: 'AbaElieuda.tsx', name: 'AbaElieuda', start: 4955, end: 5023, aba: 'elieuda' },
  { file: 'AbaConferencia.tsx', name: 'AbaConferencia', start: 5025, end: 5541, aba: 'conferencia' },
  { file: 'AbaRelatorios.tsx', name: 'AbaRelatorios', start: 5543, end: 5685, aba: 'relatorios' },
  { file: 'AbaSeguranca.tsx', name: 'AbaSeguranca', start: 5687, end: 5846, aba: 'seguranca' }
];

const skip = new Set([
  'App', 'React', 'useState', 'useEffect', 'useCallback', 'useRef', 'config',
  'true', 'false', 'null', 'undefined', 'window', 'document', 'Date', 'Math',
  'Number', 'String', 'Array', 'Object', 'JSON', 'Map', 'Set', 'Boolean',
  'console', 'localStorage', 'fetch', 'alert', 'confirm', 'parseFloat', 'parseInt',
  'isNaN', 'Promise', 'FileReader', 'Image', 'Blob', 'URL', 'navigator'
]);

const defined = new Set();
for (const line of lines) {
  const top = /^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)/.exec(line);
  const app = /^  (?:const|function)\s+([A-Za-z_$][\w$]*)/.exec(line);
  const state = /^(?:  )?const\s+\[([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\]/.exec(line);
  if (top && !skip.has(top[1])) defined.add(top[1]);
  if (app && !skip.has(app[1])) defined.add(app[1]);
  if (state) {
    defined.add(state[1]);
    defined.add(state[2]);
  }
}

function usedFrom(chunk) {
  const stripped = chunk
    .replace(/`(?:\\.|[^`])*`/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, '""')
    .replace(/"(?:\\.|[^"\\])*"/g, '""');
  const used = [];
  for (const name of defined) {
    if (skip.has(name)) continue;
    const re = new RegExp(`(?<![A-Za-z0-9_$.])${name}(?![A-Za-z0-9_$:])`);
    if (re.test(stripped)) used.push(name);
  }
  used.sort();
  return used;
}

const generated = [];
for (const tab of tabs) {
  const inner = lines.slice(tab.start, tab.end - 1).join('\n');
  const used = usedFrom(inner);
  const dest = used.map(n => `    ${n}`).join(`,${nl}`);
  const types = used.map(n => `  ${n}: any;`).join(nl);
  const file = `export function ${tab.name}(p: {${nl}${types}${nl}}) {${nl}  const {${nl}${dest}${nl}  } = p;${nl}  return (${nl}${inner}${nl}  );${nl}}${nl}`;
  fs.writeFileSync(path.join(abasDir, tab.file), file);
  generated.push({ ...tab, used });
}

const importBlock = [
  ...generated.map(t => `import { ${t.name} } from './abas/${t.name}';`),
  `import { AbaCadastroProdutos } from './abas/AbaCadastroProdutos';`,
  `import { AbaCadastroFornecedores } from './abas/AbaCadastroFornecedores';`
].join('\n');

function call(tab) {
  const props = tab.used.map(n => `              ${n}={${n}}`).join('\n');
  const cond = tab.aba === 'manutencao'
    ? `tabAtiva === 'manutencao' && usuarioLogado?.permissoes.manutencao`
    : `tabAtiva === '${tab.aba}'`;
  return `          {${cond} && (\n            <${tab.name}\n${props}\n            />\n          )}`;
}

let out = lines.slice();
for (const tab of [...generated].reverse()) {
  out.splice(tab.start - 1, tab.end - tab.start + 1, ...call(tab).split('\n'));
}

const cadastro = `          {tabAtiva === 'cadastroProdutos' && (
            <AbaCadastroProdutos
              setTabAtiva={setTabAtiva}
              itensCotacao={itensCotacao}
              novoProdutoCadastro={novoProdutoCadastro}
              setNovoProdutoCadastro={setNovoProdutoCadastro}
              cadastrarProduto={cadastrarProduto}
              excluirProdutoCadastrado={excluirProdutoCadastrado}
            />
          )}
          {tabAtiva === 'cadastroFornecedores' && (
            <AbaCadastroFornecedores
              setTabAtiva={setTabAtiva}
              fornecedoresCotacao={fornecedoresCotacao}
              novoFornecedorCadastro={novoFornecedorCadastro}
              setNovoFornecedorCadastro={setNovoFornecedorCadastro}
              cadastrarFornecedor={cadastrarFornecedor}
              removerFornecedorCotacao={removerFornecedorCotacao}
            />
          )}`;

let insertAt = out.findIndex(l => l.includes('<AbaPendencias'));
while (insertAt < out.length && !out[insertAt].includes('/>')) insertAt++;
insertAt += 1;
while (insertAt < out.length && out[insertAt].trim() === ')}') insertAt++;
out.splice(insertAt + 1, 0, ...cadastro.split('\n'));

out.splice(1, 0, importBlock);
fs.writeFileSync(srcPath, out.join(nl));
console.log('ok', generated.map(t => `${t.name}:${t.used.length}`).join(' '));
console.log(generated.map(t => t.name + ' => ' + t.used.join(', ')).join('\n'));
