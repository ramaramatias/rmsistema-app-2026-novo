import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const credenciais = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID || '';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  const databaseURL = process.env.FIREBASE_DATABASE_URL || '';

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    throw new Error('Firebase sem configuração (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY e FIREBASE_DATABASE_URL).');
  }

  return { projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n'), databaseURL };
};

export const bancoFirebase = () => {
  const config = credenciais();
  const app = getApps()[0] || initializeApp({
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey
    }),
    databaseURL: config.databaseURL
  });
  return getDatabase(app);
};

const lerRegistro = (dados: unknown): Record<string, unknown> => {
  const desembrulhado = dados && typeof dados === 'object' && !Array.isArray(dados) && 'record' in dados
    ? (dados as { record: unknown }).record
    : dados;
  const registro = typeof desembrulhado === 'string' ? JSON.parse(desembrulhado) as unknown : desembrulhado;
  if (!registro || typeof registro !== 'object' || Array.isArray(registro)) {
    throw new Error('Registro da nuvem inválido.');
  }
  return registro as Record<string, unknown>;
};

export async function lerNuvemFirebase(desde?: string) {
  const snapshot = await bancoFirebase().ref('sistemaGestao').get();
  const salvo = snapshot.val() as { versao?: unknown; record?: unknown } | null;
  const versao = typeof salvo?.versao === 'string' ? salvo.versao : '';

  if (versao && desde === versao) {
    return { versao, semMudanca: true as const };
  }

  return { versao, record: salvo?.record == null ? {} : lerRegistro(salvo.record) };
}

export async function gravarNuvemFirebase(corpo: unknown) {
  const entrada = corpo && typeof corpo === 'object' && !Array.isArray(corpo)
    ? corpo as Record<string, unknown>
    : {};
  const versaoBase = typeof entrada.versaoBase === 'string' ? entrada.versaoBase : '';
  const record = { ...lerRegistro(entrada) };
  delete record.versaoBase;
  const recordJson = JSON.stringify(record);
  const versao = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const resultado = await bancoFirebase().ref('sistemaGestao').transaction(atual => {
    if (atual === null) {
      // A cold serverless instance starts with an empty local cache; Firebase retries with server data.
      return { versao, record: recordJson };
    }
    const salvo = atual && typeof atual === 'object' ? atual as { versao?: unknown } : {};
    const versaoAtual = typeof salvo.versao === 'string' ? salvo.versao : '';
    if (versaoBase && versaoAtual !== versaoBase) return;
    return { versao, record: recordJson };
  }, undefined, false);

  const valorAtual = resultado.snapshot.val() as { versao?: unknown } | null;
  const versaoAtual = typeof valorAtual?.versao === 'string' ? valorAtual.versao : '';
  if (!resultado.committed) {
    return { conflito: true as const, versao: versaoAtual };
  }
  return { versao: versaoAtual || versao, record };
}
