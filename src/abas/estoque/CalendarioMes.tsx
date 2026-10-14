import { useMemo, useState } from 'react';

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const IDS_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

export type MesId = (typeof IDS_MES)[number];

export const mesIdDeData = (data: Date): MesId => IDS_MES[data.getMonth()];

export const rotuloMes = (id: MesId, ano?: number) => {
  const indice = IDS_MES.indexOf(id);
  return ano ? `${MESES[indice]} de ${ano}` : MESES[indice];
};

const mesmoDia = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function CalendarioMes(p: {
  data: Date;
  onChange: (data: Date) => void;
}) {
  const [visivel, setVisivel] = useState(false);
  const [cursor, setCursor] = useState(() => new Date(p.data.getFullYear(), p.data.getMonth(), 1));
  const hoje = new Date();

  const celulas = useMemo(() => {
    const ano = cursor.getFullYear();
    const mes = cursor.getMonth();
    const primeiro = new Date(ano, mes, 1);
    const ultimo = new Date(ano, mes + 1, 0).getDate();
    const inicioSemana = primeiro.getDay();
    const lista: Array<{ dia: number; data: Date } | null> = [];
    for (let i = 0; i < inicioSemana; i++) lista.push(null);
    for (let dia = 1; dia <= ultimo; dia++) lista.push({ dia, data: new Date(ano, mes, dia) });
    while (lista.length % 7 !== 0) lista.push(null);
    return lista;
  }, [cursor]);

  const textoCampo = `${String(p.data.getDate()).padStart(2, '0')}/${String(p.data.getMonth() + 1).padStart(2, '0')}/${p.data.getFullYear()}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setVisivel(atual => !atual)}
        className="min-w-[260px] cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-700"
      >
        {textoCampo} · {MESES[p.data.getMonth()]}
      </button>
      {visivel && (
        <div className="absolute right-0 z-20 mt-2 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setCursor(atual => new Date(atual.getFullYear(), atual.getMonth() - 1, 1))} className="cursor-pointer rounded-lg border-0 bg-slate-100 px-2 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200">‹</button>
            <strong className="text-sm font-black text-slate-900">{MESES[cursor.getMonth()]} {cursor.getFullYear()}</strong>
            <button type="button" onClick={() => setCursor(atual => new Date(atual.getFullYear(), atual.getMonth() + 1, 1))} className="cursor-pointer rounded-lg border-0 bg-slate-100 px-2 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DIAS_SEMANA.map((dia, indice) => (
              <span key={`${dia}-${indice}`} className="py-1 text-[11px] font-black uppercase tracking-wide text-slate-500">{dia}</span>
            ))}
            {celulas.map((celula, indice) => {
              if (!celula) return <span key={`vazio-${indice}`} />;
              const escolhido = mesmoDia(celula.data, p.data);
              const ehHoje = mesmoDia(celula.data, hoje);
              return (
                <button
                  key={celula.data.toISOString()}
                  type="button"
                  onClick={() => {
                    p.onChange(celula.data);
                    setCursor(new Date(celula.data.getFullYear(), celula.data.getMonth(), 1));
                  }}
                  className={`h-8 cursor-pointer rounded-lg border-0 text-[12px] font-bold ${escolhido ? 'bg-teal-700 text-white' : ehHoje ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-200' : 'bg-transparent text-slate-700 hover:bg-slate-100'}`}
                >
                  {celula.dia}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
