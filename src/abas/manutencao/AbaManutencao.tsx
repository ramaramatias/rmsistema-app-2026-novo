import { useEffect, useRef, useState } from 'react';

function AssinaturaCanvas({ onChange }: { onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desenhando = useRef(false);
  const moveu = useRef(false);

  const fundo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => { fundo(); }, []);

  const ponto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const salvar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/jpeg', 0.72));
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={560}
        height={180}
        className="h-40 w-full touch-none rounded-xl bg-white ring-1 ring-slate-200"
        onPointerDown={e => {
          desenhando.current = true;
          moveu.current = false;
          const ctx = canvasRef.current?.getContext('2d');
          if (!ctx) return;
          const p = ponto(e);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (!desenhando.current) return;
          const ctx = canvasRef.current?.getContext('2d');
          if (!ctx) return;
          moveu.current = true;
          const p = ponto(e);
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = '#0f766e';
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }}
        onPointerUp={() => {
          desenhando.current = false;
          if (moveu.current) salvar();
        }}
      />
      <button type="button" onClick={() => { fundo(); onChange(''); }} className="mt-2 cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200">Limpar assinatura</button>
    </div>
  );
}

const dataLocalChave = (valor?: string) => {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
};

const criarImagemRelatorioManutencao = (ordens: any[], normalizarStatus: (status?: string) => string) => {
  const hoje = dataLocalChave(new Date().toISOString());
  const grupos = [
    { status: 'pendente', titulo: 'PENDENTES', cor: '#0284c7' },
    { status: 'andamento', titulo: 'EM ANDAMENTO', cor: '#d97706' },
    { status: 'pausada', titulo: 'PAUSADAS', cor: '#7c3aed' },
    { status: 'concluida', titulo: 'CONCLUÍDAS HOJE', cor: '#059669' }
  ].map(grupo => ({
    ...grupo,
    ordens: (ordens || [])
      .filter(ordem => normalizarStatus(ordem.status) === grupo.status)
      .filter(ordem => grupo.status !== 'concluida' || dataLocalChave(ordem.concluidaEm) === hoje)
      .sort((a, b) => String(b.atualizadoEm || b.criadoEm || '').localeCompare(String(a.atualizadoEm || a.criadoEm || '')))
  }));

  const medida = document.createElement('canvas');
  const medidaContexto = medida.getContext('2d');
  if (!medidaContexto) throw new Error('Não foi possível preparar a imagem do relatório.');
  const largura = 1200;
  const margem = 56;
  const larguraTexto = largura - margem * 2 - 32;
  const quebrarTexto = (texto: string, fonte: string) => {
    medidaContexto.font = fonte;
    const palavras = String(texto || '').split(/\s+/).filter(Boolean);
    const linhas: string[] = [];
    let linha = '';
    palavras.forEach(palavra => {
      const candidata = linha ? `${linha} ${palavra}` : palavra;
      if (linha && medidaContexto.measureText(candidata).width > larguraTexto) {
        linhas.push(linha);
        linha = palavra;
      } else {
        linha = candidata;
      }
    });
    if (linha) linhas.push(linha);
    return linhas;
  };
  const dadosGrupos = grupos.map(grupo => ({
    ...grupo,
    itens: grupo.ordens.map(ordem => {
      const linhas = [
        `${ordem.local || 'Local não informado'} • ${ordem.tipo || 'Tipo não informado'} • Prioridade ${String(ordem.prioridade || 'média').replace(/^./, (letra: string) => letra.toUpperCase())}`,
        ordem.descricao || 'Descrição não informada',
        ...(grupo.status === 'pausada' && ordem.motivoPausa ? [`Motivo da pausa: ${ordem.motivoPausa}`] : []),
        ...(grupo.status === 'concluida' && ordem.observacaoConclusao ? [`Serviço realizado: ${ordem.observacaoConclusao}`] : []),
        ...(ordem.responsavel || ordem.assinadoPor ? [`Responsável: ${ordem.assinadoPor || ordem.responsavel}`] : [])
      ].flatMap((linha, indice) => quebrarTexto(linha, indice === 1 ? '600 22px Arial' : '18px Arial'));
      return { ordem, linhas, altura: 32 + linhas.length * 30 };
    })
  }));
  const altura = 235 + dadosGrupos.reduce((soma, grupo) =>
    soma + 62 + (grupo.itens.length ? grupo.itens.reduce((total, item) => total + item.altura + 14, 0) : 56), 0);
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível desenhar a imagem do relatório.');

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, largura, altura);
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(0, 0, largura, 168);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Arial';
  ctx.fillText('RELATÓRIO DE MANUTENÇÃO', margem, 68);
  ctx.font = '22px Arial';
  ctx.fillText(`Pão da Vida • ${new Date().toLocaleDateString('pt-BR')}`, margem, 112);
  const yResumo = 198;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px Arial';
  ctx.fillText(
    `Pendentes: ${dadosGrupos[0].ordens.length}   Em andamento: ${dadosGrupos[1].ordens.length}   Pausadas: ${dadosGrupos[2].ordens.length}   Concluídas hoje: ${dadosGrupos[3].ordens.length}`,
    margem,
    yResumo
  );

  let y = 244;
  dadosGrupos.forEach(grupo => {
    ctx.fillStyle = grupo.cor;
    ctx.font = 'bold 23px Arial';
    ctx.fillText(`${grupo.titulo} (${grupo.ordens.length})`, margem, y);
    y += 25;
    if (!grupo.itens.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = '18px Arial';
      ctx.fillText('Nenhuma ordem.', margem + 8, y + 19);
      y += 56;
      return;
    }
    grupo.itens.forEach(item => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(margem, y, largura - margem * 2, item.altura, 12);
      ctx.fill();
      ctx.fillStyle = grupo.cor;
      ctx.fillRect(margem, y + 8, 6, item.altura - 16);
      let linhaY = y + 30;
      item.linhas.forEach((linha, indice) => {
        ctx.fillStyle = indice === 1 ? '#0f172a' : '#475569';
        ctx.font = indice === 1 ? '600 22px Arial' : '18px Arial';
        ctx.fillText(linha, margem + 20, linhaY);
        linhaY += 30;
      });
      y += item.altura + 14;
    });
    y += 16;
  });
  return canvas;
};

export function AbaManutencao(p: {
  LOCAIS_MANUTENCAO: any;
  MOTIVOS_PAUSA_MANUTENCAO: any;
  MOTIVOS_COMPRA_PAUSA: any;
  TIPOS_MANUTENCAO: any;
  adicionarOrdemManutencao: any;
  atualizarStatusOrdem: any;
  confirmarConclusaoOrdem: any;
  confirmarPausaOrdem: any;
  registrarCompraOrdem: any;
  corPrioridadeOrdem: any;
  classeStatusOrdem: any;
  escolherFotoOrdem: any;
  filtroOrdensManutencao: any;
  fotoAmpliada: any;
  motivoPausaEscolhido: any;
  motivoPausaOutro: any;
  nomeUsuarioLogado: any;
  novaOrdemDescricao: any;
  novaOrdemFoto: any;
  novaOrdemLocal: any;
  novaOrdemPrioridade: any;
  novaOrdemTipo: any;
  ordemPausaId: any;
  ordensAndamentoQtd: any;
  ordensConcluidasQtd: any;
  ordensFiltradas: any;
  ordensManutencao: any;
  ordensNaoRealizadaQtd: any;
  ordensPausadaQtd: any;
  ordensPendenteQtd: any;
  pedirMotivoPausa: any;
  removerOrdemManutencao: any;
  rotuloStatusOrdem: any;
  setFiltroOrdensManutencao: any;
  setFotoAmpliada: any;
  setMotivoPausaEscolhido: any;
  setMotivoPausaOutro: any;
  setNovaOrdemDescricao: any;
  setNovaOrdemFoto: any;
  setNovaOrdemLocal: any;
  setNovaOrdemPrioridade: any;
  setNovaOrdemTipo: any;
  setOrdemPausaId: any;
  setTabAtiva: any;
  statusOrdemNormalizado: any;
}) {
  const {
    LOCAIS_MANUTENCAO,
    MOTIVOS_PAUSA_MANUTENCAO,
    MOTIVOS_COMPRA_PAUSA,
    TIPOS_MANUTENCAO,
    adicionarOrdemManutencao,
    atualizarStatusOrdem,
    confirmarConclusaoOrdem,
    confirmarPausaOrdem,
    registrarCompraOrdem,
    corPrioridadeOrdem,
    classeStatusOrdem,
    escolherFotoOrdem,
    filtroOrdensManutencao,
    fotoAmpliada,
    motivoPausaEscolhido,
    motivoPausaOutro,
    nomeUsuarioLogado,
    novaOrdemDescricao,
    novaOrdemFoto,
    novaOrdemLocal,
    novaOrdemPrioridade,
    novaOrdemTipo,
    ordemPausaId,
    ordensAndamentoQtd,
    ordensConcluidasQtd,
    ordensFiltradas,
    ordensManutencao,
    ordensNaoRealizadaQtd,
    ordensPausadaQtd,
    ordensPendenteQtd,
    pedirMotivoPausa,
    removerOrdemManutencao,
    rotuloStatusOrdem,
    setFiltroOrdensManutencao,
    setFotoAmpliada,
    setMotivoPausaEscolhido,
    setMotivoPausaOutro,
    setNovaOrdemDescricao,
    setNovaOrdemFoto,
    setNovaOrdemLocal,
    setNovaOrdemPrioridade,
    setNovaOrdemTipo,
    setOrdemPausaId,
    setTabAtiva,
    statusOrdemNormalizado
  } = p;
  const [ordemConclusaoId, setOrdemConclusaoId] = useState('');
  const [passoConclusao, setPassoConclusao] = useState<1 | 2>(1);
  const [observacaoConclusao, setObservacaoConclusao] = useState('');
  const [assinadoPor, setAssinadoPor] = useState('');
  const [assinaturaImg, setAssinaturaImg] = useState('');
  const abrirConclusao = (id: string) => {
    setOrdemConclusaoId(id);
    setPassoConclusao(1);
    setObservacaoConclusao('');
    setAssinadoPor(nomeUsuarioLogado || '');
    setAssinaturaImg('');
  };
  const fecharConclusao = () => {
    setOrdemConclusaoId('');
    setPassoConclusao(1);
    setObservacaoConclusao('');
    setAssinaturaImg('');
  };
  const [passoPausa, setPassoPausa] = useState<1 | 2 | 3>(1);
  const [pausaSolicitante, setPausaSolicitante] = useState('');
  const [pausaEquipamento, setPausaEquipamento] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [assinaturaAutorizacao, setAssinaturaAutorizacao] = useState('');
  const [ordemCompraId, setOrdemCompraId] = useState('');
  const [compraComprador, setCompraComprador] = useState('');
  const [compraValor, setCompraValor] = useState('');
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
  const motivoPedeCompra = (motivo: string) => (MOTIVOS_COMPRA_PAUSA || []).includes(motivo);
  const motivoPedeAutorizacao = (motivo: string) => String(motivo || '').toLowerCase().includes('autoriza');
  const temValorCompra = (ordem: any) => ordem?.valorEquipamento !== undefined && ordem?.valorEquipamento !== null && !Number.isNaN(Number(ordem.valorEquipamento));
  const abrirPausa = (id: string) => {
    setPassoPausa(1);
    setPausaSolicitante(nomeUsuarioLogado || '');
    setPausaEquipamento('');
    setAutorizadoPor(nomeUsuarioLogado || '');
    setAssinaturaAutorizacao('');
    pedirMotivoPausa(id);
  };
  const fecharPausa = () => {
    setOrdemPausaId('');
    setPassoPausa(1);
    setPausaEquipamento('');
    setAssinaturaAutorizacao('');
  };
  const abrirRegistroCompra = (ordem: any) => {
    setOrdemCompraId(ordem.id);
    setCompraComprador(nomeUsuarioLogado || '');
    setCompraValor('');
  };
  const fecharRegistroCompra = () => {
    setOrdemCompraId('');
    setCompraValor('');
  };
  const campo = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/15';
  const rotulo = 'mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500';
  const botaoAcao = 'cursor-pointer rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50';
  const filtros: { id: typeof filtroOrdensManutencao; nome: string; qtd: number }[] = [
    { id: 'pendente', nome: 'Pendente', qtd: ordensPendenteQtd },
    { id: 'andamento', nome: 'Em andamento', qtd: ordensAndamentoQtd },
    { id: 'pausada', nome: 'Pausada', qtd: ordensPausadaQtd },
    { id: 'concluida', nome: 'Concluída', qtd: ordensConcluidasQtd },
    { id: 'nao_realizada', nome: 'Não realizada', qtd: ordensNaoRealizadaQtd },
    { id: 'todas', nome: 'Todas', qtd: ordensManutencao.length }
  ];
  const nomePrioridade = (valor: string) => valor === 'urgente' ? 'Urgente' : valor === 'alta' ? 'Alta' : valor === 'baixa' ? 'Baixa' : 'Média';
  const MESES_PT = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const chaveMesOrdem = (ordem: any) => {
    const data = ordem?.dataCompra || ordem?.criadoEm || ordem?.concluidaEm || '';
    const parsed = Date.parse(String(data));
    const dataOk = Number.isNaN(parsed) ? new Date(Number(ordem?.id) || Date.now()) : new Date(parsed);
    if (Number.isNaN(dataOk.getTime())) return '';
    return `${dataOk.getFullYear()}-${String(dataOk.getMonth() + 1).padStart(2, '0')}`;
  };
  const rotuloMes = (chave: string) => {
    const [ano, mes] = chave.split('-');
    const nome = MESES_PT[Number(mes) - 1] || mes;
    return `${nome} de ${ano}`;
  };
  const gastosPorMes = (() => {
    const mapa: { [chave: string]: { total: number; qtd: number } } = {};
    (ordensManutencao || []).forEach((ordem: any) => {
      const valor = Number(ordem?.valorEquipamento);
      if (!valor || Number.isNaN(valor)) return;
      const chave = chaveMesOrdem(ordem);
      if (!chave) return;
      const atual = mapa[chave] || { total: 0, qtd: 0 };
      mapa[chave] = { total: atual.total + valor, qtd: atual.qtd + 1 };
    });
    return Object.entries(mapa)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([chave, dados]) => ({ chave, nome: rotuloMes(chave), ...dados }));
  })();
  const agora = new Date();
  const chaveMesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  const gastoMesAtual = gastosPorMes.find(item => item.chave === chaveMesAtual)?.total || 0;
  const gastoGeral = gastosPorMes.reduce((soma, item) => soma + item.total, 0);
  const moeda = (valor: number) => `R$ ${Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const compartilharRelatorio = async () => {
    setGerandoRelatorio(true);
    try {
      const canvas = criarImagemRelatorioManutencao(ordensManutencao, statusOrdemNormalizado);
      const imagem = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível criar o arquivo da imagem.')), 'image/png');
      });
      const arquivo = new File([imagem], `relatorio-manutencao-${dataLocalChave(new Date().toISOString())}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [arquivo] }) && navigator.share) {
        await navigator.share({ files: [arquivo], title: 'Relatório de manutenção', text: 'Relatório de manutenção do Pão da Vida' });
        return;
      }
      const url = URL.createObjectURL(imagem);
      const link = document.createElement('a');
      link.href = url;
      link.download = arquivo.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      window.alert('A imagem do relatório foi baixada. Anexe o arquivo no WhatsApp para enviar.');
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return;
      console.error('Erro ao gerar/compartilhar relatório de manutenção:', erro);
      window.alert('Não foi possível gerar ou compartilhar a imagem do relatório. Tente novamente.');
    } finally {
      setGerandoRelatorio(false);
    }
  };
  return (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 sm:p-6">
              <button type="button" onClick={() => setTabAtiva('pendencias')} className="mb-4 cursor-pointer rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-white">← Voltar ao sistema</button>
              <div className="mb-1">
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">Operação</p>
                <h2 className="m-0 text-xl font-black tracking-tight text-slate-900">Manutenção</h2>
              </div>
              <p className="mb-5 mt-1 text-sm text-slate-500">Abra ordem de serviço, acompanhe o andamento e registre o reparo. As fotos ficam neste aparelho; o texto sincroniza na nuvem.</p>

              <div className="mb-5">
                <button
                  type="button"
                  onClick={compartilharRelatorio}
                  disabled={gerandoRelatorio}
                  className="cursor-pointer rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-600 disabled:cursor-wait disabled:opacity-60"
                >
                  {gerandoRelatorio ? 'Preparando imagem...' : 'Gerar imagem para WhatsApp'}
                </button>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {filtros.map(filtro => {
                  const ativa = filtroOrdensManutencao === filtro.id;
                  return (
                    <button
                      type="button"
                      key={filtro.id}
                      onClick={() => setFiltroOrdensManutencao(filtro.id)}
                      className={`cursor-pointer rounded-2xl px-3 py-3 text-left transition ${ativa ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/20' : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-white'}`}
                    >
                      <div className={`text-[10px] font-bold uppercase tracking-wide ${ativa ? 'text-teal-100' : 'text-slate-500'}`}>{filtro.nome}</div>
                      <div className="text-xl font-black">{filtro.qtd}</div>
                    </button>
                  );
                })}
              </div>

              <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="m-0 text-[11px] font-semibold capitalize text-slate-500">Gastos de {rotuloMes(chaveMesAtual)}</p>
                  <p className="m-0 text-sm font-semibold tabular-nums text-slate-700">{moeda(gastoMesAtual)}</p>
                </div>
                {gastosPorMes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    {gastosPorMes.map(item => (
                      <span key={item.chave} className={item.chave === chaveMesAtual ? 'font-semibold text-slate-600' : ''}>
                        {item.nome}: {moeda(item.total)}
                      </span>
                    ))}
                    {gastoGeral > 0 && <span>Total: {moeda(gastoGeral)}</span>}
                  </div>
                )}
              </div>

              <div className="mb-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <h3 className="m-0 mb-3 text-sm font-bold text-slate-900">Nova ordem de serviço</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={rotulo}>Local</label>
                    <select value={novaOrdemLocal} onChange={e => setNovaOrdemLocal(e.target.value)} className={campo}>
                      {LOCAIS_MANUTENCAO.map((local: string) => <option key={local} value={local}>{local}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={rotulo}>Tipo</label>
                    <select value={novaOrdemTipo} onChange={e => setNovaOrdemTipo(e.target.value)} className={campo}>
                      {TIPOS_MANUTENCAO.map((tipo: string) => <option key={tipo} value={tipo}>{tipo}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={rotulo}>Prioridade</label>
                    <select value={novaOrdemPrioridade} onChange={e => setNovaOrdemPrioridade(e.target.value as 'baixa' | 'media' | 'alta' | 'urgente')} className={campo}>
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className={rotulo}>O que precisa ser consertado?</label>
                    <input type="text" placeholder="Descreva o reparo..." value={novaOrdemDescricao} onChange={e => setNovaOrdemDescricao(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarOrdemManutencao()} className={campo} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className={`${botaoAcao} inline-flex items-center`}>
                    Foto
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoOrdem(event)} />
                  </label>
                  <button type="button" onClick={adicionarOrdemManutencao} className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-600">Abrir ordem</button>
                </div>
                {novaOrdemFoto && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={novaOrdemFoto} alt="Prévia" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
                    <button type="button" onClick={() => setNovaOrdemFoto('')} className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Remover foto</button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {ordensFiltradas.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center ring-1 ring-slate-200">
                    <strong className="mb-1 block text-sm text-slate-900">Nenhuma ordem neste filtro</strong>
                    <span className="text-sm text-slate-500">Abra uma ordem acima ou escolha outro status.</span>
                  </div>
                ) : ordensFiltradas.map((ordem: any) => {
                  const statusAtual = statusOrdemNormalizado(ordem.status);
                  const pausada = statusAtual === 'pausada';
                  return (
                  <div key={ordem.id} className={`rounded-2xl bg-white p-4 ${pausada ? 'ring-2 ring-teal-700' : 'ring-1 ring-slate-200'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${classeStatusOrdem(ordem.status)}`}>{rotuloStatusOrdem(ordem.status)}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${corPrioridadeOrdem(ordem.prioridade)}`}>{nomePrioridade(ordem.prioridade)}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{ordem.local}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{ordem.tipo}</span>
                        </div>
                        <p className="m-0 text-base font-bold text-slate-900">{ordem.descricao}</p>
                        {(ordem.equipamento || temValorCompra(ordem)) && (
                          <p className="mb-0 mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-800 ring-1 ring-slate-200">
                            {(ordem.solicitadoPor || (!temValorCompra(ordem) && ordem.compradoPor)) && (
                              <span className="mr-2">Solicitado por {ordem.solicitadoPor || ordem.compradoPor} •</span>
                            )}
                            {ordem.equipamento ? <>Compra: {ordem.equipamento}</> : 'Compra'}
                            {temValorCompra(ordem) && (
                              <>
                                {ordem.compradoPor && <span className="ml-2">Comprado por {ordem.compradoPor} •</span>}
                                <span className="ml-2 font-black text-teal-800">R$ {Number(ordem.valorEquipamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </>
                            )}
                            {!temValorCompra(ordem) && ordem.equipamento && (
                              <span className="ml-2 font-semibold text-slate-500">Aguardando valor</span>
                            )}
                          </p>
                        )}
                        <p className="mb-0 mt-1 text-[12px] text-slate-500">Aberta por {ordem.criadoPor} • {new Date(ordem.criadoEm).toLocaleString('pt-BR')}{ordem.responsavel ? ` • Responsável: ${ordem.responsavel}` : ''}</p>
                        {pausada && ordem.motivoPausa && (
                          <div className="mt-3 rounded-xl bg-teal-700 px-4 py-3 text-white shadow-sm shadow-teal-900/20">
                            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-100">Motivo da pausa</div>
                            <div className="mt-0.5 text-base font-black leading-snug">{ordem.motivoPausa}</div>
                            {ordem.autorizadoPor && (
                              <div className="mt-2 text-[12px] font-bold text-teal-50">Autorizado por: {ordem.autorizadoPor}</div>
                            )}
                            {ordem.assinaturaAutorizacao && (
                              <img src={ordem.assinaturaAutorizacao} alt="Assinatura da autorização" className="mt-2 h-14 w-auto max-w-full rounded-lg bg-white object-contain" />
                            )}
                          </div>
                        )}
                        {ordem.autorizadoPor && !pausada && (
                          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Autorização</div>
                            <div className="text-[12px] font-bold text-teal-800">Autorizado por: {ordem.autorizadoPor}</div>
                            {ordem.assinaturaAutorizacao && (
                              <img src={ordem.assinaturaAutorizacao} alt="Assinatura da autorização" className="mt-2 h-14 w-auto max-w-full rounded-lg bg-white object-contain ring-1 ring-slate-200" />
                            )}
                          </div>
                        )}
                        {statusOrdemNormalizado(ordem.status) === 'concluida' && (ordem.observacaoConclusao || ordem.assinadoPor || ordem.assinatura) && (
                          <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                            {ordem.observacaoConclusao && (
                              <div className="mb-2">
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Observação</div>
                                <div className="text-sm font-semibold text-slate-800">{ordem.observacaoConclusao}</div>
                              </div>
                            )}
                            {ordem.assinadoPor && (
                              <div className="text-[12px] font-bold text-teal-800">Assinado por: {ordem.assinadoPor}</div>
                            )}
                            {ordem.assinatura && (
                              <img src={ordem.assinatura} alt="Assinatura" className="mt-2 h-16 w-auto max-w-full rounded-lg bg-white object-contain ring-1 ring-slate-200" />
                            )}
                          </div>
                        )}
                      </div>
                      {ordem.foto && (
                        <button type="button" onClick={() => setFotoAmpliada(ordem.foto || '')} className="shrink-0 cursor-pointer border-0 bg-transparent p-0">
                          <img src={ordem.foto} alt="Foto da ordem" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" />
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {statusAtual === 'pendente' && <button type="button" onClick={() => atualizarStatusOrdem(ordem.id, 'andamento')} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-teal-600">Colocar em andamento</button>}
                      {statusAtual === 'andamento' && <button type="button" onClick={() => abrirPausa(ordem.id)} className={botaoAcao}>Pausar</button>}
                      {(statusAtual === 'andamento' || statusAtual === 'pausada') && <button type="button" onClick={() => abrirConclusao(ordem.id)} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-teal-600">Concluir</button>}
                      {statusAtual === 'pausada' && <button type="button" onClick={() => atualizarStatusOrdem(ordem.id, 'andamento')} className={botaoAcao}>Retomar</button>}
                      {ordem.equipamento && !temValorCompra(ordem) && statusAtual !== 'nao_realizada' && (
                        <button type="button" onClick={() => abrirRegistroCompra(ordem)} className="cursor-pointer rounded-lg bg-teal-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-teal-600">Informar valor da compra</button>
                      )}
                      {statusAtual !== 'nao_realizada' && statusAtual !== 'concluida' && <button type="button" onClick={() => atualizarStatusOrdem(ordem.id, 'nao_realizada')} className={botaoAcao}>Não realizada</button>}
                      <label className={`${botaoAcao} inline-flex items-center`}>
                        {ordem.foto ? 'Trocar foto' : '+ Foto'}
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={event => escolherFotoOrdem(event, ordem.id)} />
                      </label>
                      {(p.nomeUsuarioLogado === 'Ramara') && (
                      <button type="button" onClick={() => removerOrdemManutencao(ordem.id)} className="cursor-pointer rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50">Excluir</button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
              {ordemPausaId && (
                <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-slate-900/80 p-5">
                  <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                    {passoPausa === 1 ? (
                      <>
                        <h3 className="m-0 text-base font-black text-slate-900">Por que a ordem vai pausar?</h3>
                        <p className="mb-3 mt-1 text-sm text-slate-500">Escolha o motivo da pausa.</p>
                        <div className="mb-3 flex flex-col gap-1.5">
                          {MOTIVOS_PAUSA_MANUTENCAO.map((motivo: string) => (
                            <label key={motivo} className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${motivoPausaEscolhido === motivo ? 'bg-teal-700 text-white' : 'bg-slate-50 text-slate-700'}`}>
                              <input type="radio" name="motivo-pausa" checked={motivoPausaEscolhido === motivo} onChange={() => setMotivoPausaEscolhido(motivo)} className="accent-teal-700" />
                              {motivo}
                            </label>
                          ))}
                        </div>
                        {motivoPausaEscolhido === 'Outro motivo' && (
                          <input type="text" placeholder="Descreva o motivo" value={motivoPausaOutro} onChange={e => setMotivoPausaOutro(e.target.value)} className={`${campo} mb-3`} />
                        )}
                        <div className="flex gap-2">
                          <button type="button" onClick={fecharPausa} className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">Cancelar</button>
                          <button type="button" onClick={() => {
                            if (motivoPedeCompra(motivoPausaEscolhido)) setPassoPausa(2);
                            else if (motivoPedeAutorizacao(motivoPausaEscolhido)) setPassoPausa(3);
                            else confirmarPausaOrdem();
                          }} className="flex-1 cursor-pointer rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-600">
                            {motivoPedeCompra(motivoPausaEscolhido) || motivoPedeAutorizacao(motivoPausaEscolhido) ? 'Continuar' : 'Pausar'}
                          </button>
                        </div>
                      </>
                    ) : passoPausa === 2 ? (
                      <>
                        <h3 className="m-0 text-base font-black text-slate-900">Solicitar compra</h3>
                        <p className="mb-3 mt-1 text-sm text-slate-500">Informe quem está pedindo e o que precisa. O valor entra depois, por quem for comprar.</p>
                        <label className={rotulo}>Nome de quem solicita</label>
                        <input type="text" value={pausaSolicitante} onChange={e => setPausaSolicitante(e.target.value)} placeholder="Seu nome" className={`${campo} mb-3`} />
                        <label className={rotulo}>Compra de equipamento / material</label>
                        <input type="text" value={pausaEquipamento} onChange={e => setPausaEquipamento(e.target.value)} placeholder="Ex.: motor, lâmpada, registro..." className={`${campo} mb-3`} />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setPassoPausa(1)} className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">Voltar</button>
                          <button type="button" onClick={() => {
                            if (!pausaSolicitante.trim() || !pausaEquipamento.trim()) {
                              window.alert('Preencha o nome de quem solicita e a compra.');
                              return;
                            }
                            confirmarPausaOrdem({
                              compra: {
                                solicitante: pausaSolicitante.trim(),
                                equipamento: pausaEquipamento.trim()
                              }
                            });
                            fecharPausa();
                          }} className="flex-1 cursor-pointer rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-600">Pausar e solicitar</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="m-0 text-base font-black text-slate-900">Autorização</h3>
                        <p className="mb-3 mt-1 text-sm text-slate-500">Quem autorizar informa o nome e assina.</p>
                        <label className={rotulo}>Nome de quem autorizou</label>
                        <input type="text" value={autorizadoPor} onChange={e => setAutorizadoPor(e.target.value)} placeholder="Nome completo" className={`${campo} mb-3`} />
                        <label className={rotulo}>Assinatura de quem autorizou</label>
                        <AssinaturaCanvas key={`auth-${ordemPausaId}`} onChange={setAssinaturaAutorizacao} />
                        <div className="mt-4 flex gap-2">
                          <button type="button" onClick={() => setPassoPausa(1)} className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">Voltar</button>
                          <button type="button" onClick={() => {
                            if (!autorizadoPor.trim() || !assinaturaAutorizacao) {
                              window.alert('Preencha o nome e faça a assinatura de quem autorizou.');
                              return;
                            }
                            confirmarPausaOrdem({
                              autorizacao: {
                                nome: autorizadoPor.trim(),
                                assinatura: assinaturaAutorizacao
                              }
                            });
                            fecharPausa();
                          }} className="flex-1 cursor-pointer rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-600">Autorizar e pausar</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              {ordemCompraId && (
                <div className="fixed inset-0 z-[10022] flex items-center justify-center bg-slate-900/80 p-5">
                  <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                    <h3 className="m-0 text-base font-black text-slate-900">Registrar compra</h3>
                    <p className="mb-3 mt-1 text-sm text-slate-500">Quem comprou informa o nome e o valor. Isso entra no gasto do mês.</p>
                    <label className={rotulo}>Nome de quem comprou</label>
                    <input type="text" value={compraComprador} onChange={e => setCompraComprador(e.target.value)} placeholder="Nome de quem fez a compra" className={`${campo} mb-3`} />
                    <label className={rotulo}>Valor (R$)</label>
                    <input type="text" value={compraValor} onChange={e => setCompraValor(e.target.value)} placeholder="0,00" className={`${campo} mb-3`} />
                    <div className="flex gap-2">
                      <button type="button" onClick={fecharRegistroCompra} className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">Cancelar</button>
                      <button type="button" onClick={() => {
                        const valor = parseFloat(compraValor.replace(',', '.'));
                        if (!compraComprador.trim() || Number.isNaN(valor) || valor < 0) {
                          window.alert('Preencha o nome de quem comprou e o valor.');
                          return;
                        }
                        registrarCompraOrdem(ordemCompraId, {
                          comprador: compraComprador.trim(),
                          valor
                        });
                        fecharRegistroCompra();
                      }} className="flex-1 cursor-pointer rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-600">Salvar valor</button>
                    </div>
                  </div>
                </div>
              )}
              {ordemConclusaoId && (
                <div className="fixed inset-0 z-[10025] flex items-center justify-center bg-slate-900/80 p-5">
                  <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                    {passoConclusao === 1 ? (
                      <>
                        <h3 className="m-0 text-base font-black text-slate-900">Observação da conclusão</h3>
                        <p className="mb-3 mt-1 text-sm text-slate-500">Descreva o que foi feito neste reparo.</p>
                        <textarea value={observacaoConclusao} onChange={e => setObservacaoConclusao(e.target.value)} placeholder="Ex.: troquei o registro e testei a água..." className={`${campo} min-h-[110px] resize-y`} />
                        <div className="mt-4 flex gap-2">
                          <button type="button" onClick={fecharConclusao} className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">Cancelar</button>
                          <button type="button" onClick={() => {
                            if (!observacaoConclusao.trim()) {
                              window.alert('Preencha a observação antes de assinar.');
                              return;
                            }
                            setPassoConclusao(2);
                          }} className="flex-1 cursor-pointer rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-600">Continuar para assinatura</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="m-0 text-base font-black text-slate-900">Assinatura de quem fez</h3>
                        <p className="mb-3 mt-1 text-sm text-slate-500">Informe o nome e assine no quadro.</p>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Nome</label>
                        <input type="text" value={assinadoPor} onChange={e => setAssinadoPor(e.target.value)} placeholder="Nome de quem concluiu" className={`${campo} mb-3`} />
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Assinatura</label>
                        <AssinaturaCanvas key={ordemConclusaoId} onChange={setAssinaturaImg} />
                        <div className="mt-4 flex gap-2">
                          <button type="button" onClick={() => setPassoConclusao(1)} className="flex-1 cursor-pointer rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200">Voltar</button>
                          <button type="button" onClick={() => {
                            if (!assinadoPor.trim() || !assinaturaImg) {
                              window.alert('Preencha o nome e faça a assinatura.');
                              return;
                            }
                            confirmarConclusaoOrdem(ordemConclusaoId, {
                              observacao: observacaoConclusao.trim(),
                              assinadoPor: assinadoPor.trim(),
                              assinatura: assinaturaImg
                            });
                            fecharConclusao();
                          }} className="flex-1 cursor-pointer rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-bold text-white hover:bg-teal-600">Concluir ordem</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              {fotoAmpliada && (
                <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-slate-900/80 p-5" onClick={() => setFotoAmpliada('')}>
                  <img src={fotoAmpliada} alt="Foto da manutenção" className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl" />
                </div>
              )}
            </section>
  );
}
