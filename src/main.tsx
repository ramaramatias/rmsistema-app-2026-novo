import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class TelaErro extends React.Component<{ children: React.ReactNode }, { erro: string; chave: number }> {
  state = { erro: "", chave: 0 };

  static getDerivedStateFromError(erro: Error) {
    return { erro: erro?.message || "Erro ao abrir o sistema" };
  }

  componentDidCatch(erro: Error) {
    console.error(erro);
  }

  render() {
    if (this.state.erro) {
      return (
        <div style={{ minHeight: "100vh", background: "#0f172a", color: "#fff", padding: 32, fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: 22 }}>O sistema travou ao abrir o painel</h1>
          <p style={{ maxWidth: 520, lineHeight: 1.5 }}>
            Clique em Recarregar. Se continuar, copie a frase pequena abaixo e avise.
          </p>
          <p style={{ opacity: 0.85, fontSize: 13 }}>{this.state.erro}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ erro: "", chave: this.state.chave + 1 });
              window.location.href = `${window.location.origin}/?ok=${Date.now()}`;
            }}
            style={{ marginTop: 16, padding: "10px 16px", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return <div key={this.state.chave}>{this.props.children}</div>;
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registros) => {
    registros.forEach((registro) => registro.unregister());
  });
  if (window.caches) {
    caches.keys().then((chaves) => chaves.forEach((chave) => caches.delete(chave)));
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TelaErro>
    <App />
  </TelaErro>
);
