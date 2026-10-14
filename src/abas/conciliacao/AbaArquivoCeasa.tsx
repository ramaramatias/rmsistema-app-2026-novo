import { useEffect, useState } from 'react';
import { CabecalhoAba, botaoPrimario, botaoSecundario, cabecalhoTabela, campo, linhaTabela, painel, rotulo, tabela, tabelaCaixa, td, th, vazio } from '../../componentes/ui';

type Boletim = {
  id: string;
  dataBoletim: string;
  baixadoEm: string;
  frutasId: string;
  hortalicasId: string;
  frutasNome: string;
  hortalicasNome: string;
};

type Item = {
  nome_produto: string;
  preco_quilo_nota: number | null;
  preco_quilo_ceasa: number | null;
  diferenca_valores: number | null;
};

const moeda = (valor: number | null) => {
  if (valor == null) return '—';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const lerNota = (arquivo: File) => new Promise<string>((resolve, reject) => {
  const leitor = new FileReader();
  leitor.onload = () => {
    const texto = String(leitor.result || '');
    resolve(texto.includes(',') ? texto.slice(texto.indexOf(',') + 1) : texto);
  };
  leitor.onerror = () => reject(new Error('Não consegui ler o PDF da nota.'));
  leitor.readAsDataURL(arquivo);
});

const linkPdf = (id: string, nome: string) => `/api/ceasa?acao=arquivo&id=${encodeURIComponent(id)}&nome=${encodeURIComponent(nome)}`;

export function AbaArquivoCeasa(p: { onVoltar: () => void }) {
  const [boletins, setBoletins] = useState<Boletim[]>([]);
  const [boletimId, setBoletimId] = useState('');
  const [nota, setNota] = useState<File | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [cruzando, setCruzando] = useState(false);

  const carregar = async () => {
    const resposta = await fetch('/api/ceasa');
    const dados = await resposta.json() as { boletins?: Boletim[]; erro?: string };
    if (!resposta.ok) throw new Error(dados.erro || 'Não consegui abrir o arquivo da CEASA.');
    const lista = Array.isArray(dados.boletins) ? dados.boletins : [];
    setBoletins(lista);
    setBoletimId(atual => atual && lista.some(item => item.id === atual) ? atual : (lista[0]?.id || ''));
  };

  useEffect(() => {
    void carregar().catch(falha => setErro(falha instanceof Error ? falha.message : 'Não consegui abrir o arquivo da CEASA.'));
  }, []);

  const buscar = async () => {
    setBuscando(true);
    setErro('');
    setAviso('');
    try {
      const resposta = await fetch('/api/ceasa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'buscar' })
      });
      const dados = await resposta.json() as { erro?: string; boletins?: Boletim[]; boletim?: Boletim };
      if (!resposta.ok) throw new Error(dados.erro || 'A CEASA não entregou os PDFs.');
      const lista = Array.isArray(dados.boletins) ? dados.boletins : [];
      setBoletins(lista);
      setBoletimId(dados.boletim?.id || lista[0]?.id || '');
      setAviso(dados.boletim ? `Captura de ${dados.boletim.baixadoEm}; data indicada no PDF: ${dados.boletim.dataBoletim}.` : 'Boletins salvos.');
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'A CEASA não entregou os PDFs.');
    } finally {
      setBuscando(false);
    }
  };

  const conciliar = async () => {
    if (!nota) {
      setErro('Anexe o PDF da nota fiscal.');
      return;
    }
    if (!boletimId) {
      setErro('Busque os boletins da CEASA antes de conciliar.');
      return;
    }
    setCruzando(true);
    setErro('');
    setAviso('');
    setItens([]);
    try {
      const conteudo = await lerNota(nota);
      const resposta = await fetch('/api/ceasa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'conciliar', boletimId, nota: conteudo })
      });
      const dados = await resposta.json() as { erro?: string; itens?: Item[]; avisoNota?: string };
      if (!resposta.ok) throw new Error(dados.erro || 'A conciliação não foi concluída.');
      setItens(Array.isArray(dados.itens) ? dados.itens : []);
      if (dados.avisoNota) setAviso(dados.avisoNota);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'A conciliação não foi concluída.');
    } finally {
      setCruzando(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-5">
      <CabecalhoAba
        voltar={{ texto: 'Conciliação', aoClicar: p.onVoltar }}
        etiqueta="Conciliação"
        titulo="Arquivo CEASA"
        descricao="O sistema busca os boletins às terças e sextas, no horário de Fortaleza, e mantém os arquivos por seis dias. O preço comparado é o do quilo."
        acoes={(
          <button type="button" className={botaoSecundario} onClick={() => void buscar()} disabled={buscando || cruzando}>
            {buscando ? 'Baixando...' : 'Buscar boletins agora'}
          </button>
        )}
      />

      {erro && <p className="m-0 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-100">{erro}</p>}
      {aviso && <p className="m-0 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">{aviso}</p>}

      <div className={painel}>
        <h3 className="m-0 text-sm font-black text-slate-900">Boletins salvos</h3>
        <div className={`${tabelaCaixa} mt-3`}>
          <table className={tabela}>
            <thead className={cabecalhoTabela}>
              <tr>
                <th className={th}>Data indicada no PDF</th>
                <th className={th}>Baixado em</th>
                <th className={th}>Hortaliças</th>
                <th className={th}>Frutas</th>
              </tr>
            </thead>
            <tbody>
              {boletins.length === 0 ? (
                <tr><td className={vazio} colSpan={4}>Nenhum boletim ainda. Use “Buscar boletins agora” ou aguarde terça ou sexta, 11:45.</td></tr>
              ) : boletins.map(boletim => (
                <tr key={boletim.id} className={linhaTabela}>
                  <td className={td}>
                    <label className="inline-flex items-center gap-2 font-semibold text-slate-800">
                      <input type="radio" name="boletim" checked={boletimId === boletim.id} onChange={() => setBoletimId(boletim.id)} />
                      {boletim.dataBoletim}
                    </label>
                  </td>
                  <td className={`${td} text-slate-500`}>{boletim.baixadoEm}</td>
                  <td className={td}><a className="font-bold text-teal-700" href={linkPdf(boletim.hortalicasId, boletim.hortalicasNome)} target="_blank" rel="noreferrer">Abrir PDF</a></td>
                  <td className={td}><a className="font-bold text-teal-700" href={linkPdf(boletim.frutasId, boletim.frutasNome)} target="_blank" rel="noreferrer">Abrir PDF</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={painel}>
        <h3 className="m-0 text-sm font-black text-slate-900">Executar conciliação</h3>
        <p className="mb-4 mt-1 text-xs text-slate-500">Anexe a nota fiscal (até 2 páginas). O Grok usa o preço por quilo da nota e divide o MC da CEASA pelos quilos da embalagem.</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className={`${rotulo} sm:min-w-80`}>
            Nota fiscal (PDF)
            <input
              type="file"
              accept="application/pdf,.pdf"
              className={campo}
              onChange={evento => setNota(evento.target.files?.[0] || null)}
            />
          </label>
          <button type="button" className={botaoPrimario} onClick={() => void conciliar()} disabled={cruzando || buscando}>
            {cruzando ? 'Conciliando...' : 'Executar Conciliação'}
          </button>
        </div>
      </div>

      {itens.length > 0 && (
        <div className={tabelaCaixa}>
          <table className={tabela}>
            <thead className={cabecalhoTabela}>
              <tr>
                <th className={th}>Produto</th>
                <th className={`${th} text-right`}>Quilo na nota</th>
                <th className={`${th} text-right`}>Quilo na CEASA</th>
                <th className={`${th} text-right`}>Diferença</th>
              </tr>
            </thead>
            <tbody>
              {itens.map(item => (
                <tr key={item.nome_produto} className={linhaTabela}>
                  <td className={`${td} font-semibold text-slate-800`}>{item.nome_produto}</td>
                  <td className={`${td} text-right`}>{moeda(item.preco_quilo_nota)}</td>
                  <td className={`${td} text-right`}>{moeda(item.preco_quilo_ceasa)}</td>
                  <td className={`${td} text-right font-bold ${item.diferenca_valores == null ? 'text-slate-400' : item.diferenca_valores > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{moeda(item.diferenca_valores)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
