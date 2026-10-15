import { Component, type ReactNode } from 'react';
import { ControlePrevisaoEstoque } from './ControlePrevisaoEstoque';

class ProtecaoEstoque extends Component<{ children: ReactNode }, { erro: string }> {
  state = { erro: '' };

  static getDerivedStateFromError(erro: Error) {
    return { erro: erro?.message || 'Falha ao abrir o estoque.' };
  }

  render() {
    if (this.state.erro) {
      return (
        <section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 ring-1 ring-rose-200">
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700">Estoque</p>
          <h2 className="m-0 mt-1 text-xl font-black text-slate-900">A tela de estoque não abriu</h2>
          <p className="mb-0 mt-2 text-sm text-slate-600">{this.state.erro}</p>
        </section>
      );
    }
    return this.props.children;
  }
}

export function AbaEstoque() {
  return (
    <ProtecaoEstoque>
      <section className="mx-auto max-w-[1250px]">
        <ControlePrevisaoEstoque />
      </section>
    </ProtecaoEstoque>
  );
}
