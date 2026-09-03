import React from 'react';

export class ErroDaAba extends React.Component<
  { children: React.ReactNode; nome?: string },
  { erro: string }
> {
  state = { erro: '' };

  static getDerivedStateFromError(erro: Error) {
    return { erro: erro?.message || 'Erro nesta aba' };
  }

  componentDidCatch(erro: Error) {
    console.error(erro);
  }

  render() {
    if (this.state.erro) {
      return (
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 ring-1 ring-rose-200">
          <h2 className="m-0 text-lg font-black text-slate-900">{this.props.nome || 'Esta aba'} não abriu</h2>
          <p className="mt-2 text-sm text-slate-600">O restante do sistema continua funcionando. Troque de aba ou recarregue.</p>
          <p className="mt-2 text-xs text-slate-500">{this.state.erro}</p>
          <button
            type="button"
            onClick={() => this.setState({ erro: '' })}
            className="mt-4 cursor-pointer rounded-xl border-0 bg-teal-700 px-4 py-2 text-sm font-bold text-white"
          >
            Tentar de novo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
