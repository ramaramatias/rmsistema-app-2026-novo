import { useState } from 'react';
import type { ItemChecklist } from '../../tipos';

const campo = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';

export function AbaChecklist({
  itens,
  statusNuvem,
  adicionarItem,
  atualizarItem,
  alternarItem,
  removerItem
}: {
  itens: ItemChecklist[];
  statusNuvem: string;
  adicionarItem: (texto: string) => void;
  atualizarItem: (id: string, texto: string) => void;
  alternarItem: (id: string) => void;
  removerItem: (id: string) => void;
}) {
  const [novoTexto, setNovoTexto] = useState('');
  const [edicaoId, setEdicaoId] = useState('');
  const [textoEdicao, setTextoEdicao] = useState('');
  const adiciona = () => {
    const texto = novoTexto.trim();
    if (!texto) return;
    adicionarItem(texto);
    setNovoTexto('');
  };
  const concluidos = itens.filter(item => item.concluido).length;

  return (
    <section className="mx-auto my-6 max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">
      <header className="mb-6">
        <p className="m-0 mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Operação</p>
        <h2 className="m-0 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Checklist</h2>
        <p className="mb-0 mt-1.5 text-sm text-slate-500">Adicione tarefas e marque os itens concluídos. A lista é compartilhada e permanece salva até você alterar os itens.</p>
      </header>

      <form
        className="mb-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={event => { event.preventDefault(); adiciona(); }}
      >
        <input
          value={novoTexto}
          onChange={event => setNovoTexto(event.target.value)}
          placeholder="Escreva um item do checklist..."
          aria-label="Novo item do checklist"
          className={campo}
        />
        <button type="submit" disabled={!novoTexto.trim()} className="cursor-pointer rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50">
          Adicionar
        </button>
      </form>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-sm font-bold text-slate-700">{concluidos} de {itens.length} concluídos</p>
        <p className={`m-0 text-xs font-semibold ${/fora|offline|não gravou|só neste/i.test(statusNuvem) ? 'text-amber-700' : 'text-emerald-700'}`}>
          {statusNuvem || 'Sincronização automática'}
        </p>
      </div>

      {itens.length ? (
        <ul className="m-0 grid list-none gap-2 p-0">
          {itens.map(item => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <input
                type="checkbox"
                checked={item.concluido}
                onChange={() => alternarItem(item.id)}
                aria-label={`Marcar ${item.texto} como ${item.concluido ? 'não concluído' : 'concluído'}`}
                className="h-5 w-5 shrink-0 accent-teal-700"
              />
              {edicaoId === item.id ? (
                <>
                  <input value={textoEdicao} onChange={event => setTextoEdicao(event.target.value)} aria-label="Editar item" className={`${campo} min-w-0 flex-1`} />
                  <button type="button" onClick={() => { if (textoEdicao.trim()) atualizarItem(item.id, textoEdicao.trim()); setEdicaoId(''); }} className="cursor-pointer rounded-lg border-0 bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-600">Salvar</button>
                  <button type="button" onClick={() => setEdicaoId('')} className="cursor-pointer rounded-lg border-0 bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">Cancelar</button>
                </>
              ) : (
                <>
                  <span className={`min-w-0 flex-1 text-sm font-semibold ${item.concluido ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.texto}</span>
                  <button type="button" onClick={() => { setEdicaoId(item.id); setTextoEdicao(item.texto); }} aria-label={`Editar ${item.texto}`} className="cursor-pointer rounded-lg border-0 bg-white px-3 py-2 text-xs font-bold text-teal-700 ring-1 ring-slate-200 hover:bg-teal-50">Editar</button>
                  <button type="button" onClick={() => removerItem(item.id)} aria-label={`Excluir ${item.texto}`} className="cursor-pointer rounded-lg border-0 bg-white px-3 py-2 text-xs font-bold text-rose-700 ring-1 ring-slate-200 hover:bg-rose-50">
                    Excluir
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 rounded-xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500 ring-1 ring-slate-200">Nenhum item no checklist. Adicione o primeiro acima.</p>
      )}
    </section>
  );
}
