import { config } from '../config';

const limparFotos = (setores: any[]) =>
  (setores || []).map(setor => ({
    ...setor,
    tarefas: (setor.tarefas || []).map((tarefa: any) => {
      if (!tarefa?.foto) return tarefa;
      const { foto, ...resto } = tarefa;
      return resto;
    })
  }));

const resposta = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}/latest`, {
  headers: { 'X-Master-Key': config.jsonbin.apiKey }
});
const dados = await resposta.json();
if (!resposta.ok || !dados.record) {
  console.log('falhou_leitura');
  process.exit(1);
}
const antes = JSON.stringify(dados.record).length;
const record = { ...dados.record, setores: limparFotos(dados.record.setores) };
const depois = JSON.stringify(record).length;
const gravar = await fetch(`https://api.jsonbin.io/v3/b/${config.jsonbin.binId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Master-Key': config.jsonbin.apiKey,
    'X-Bin-Versioning': 'true'
  },
  body: JSON.stringify(record)
});
console.log(JSON.stringify({ ok: gravar.ok, antes, depois }));
