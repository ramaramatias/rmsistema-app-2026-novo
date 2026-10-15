import { bancoFirebase } from './firebaseNuvem.js';

const chaveFoto = (id: string) => String(id).replace(/[^a-zA-Z0-9._-]/g, '_');

export async function lerFotoBlob(id: string) {
  const snapshot = await bancoFirebase().ref(`sistemaGestaoFotos/${chaveFoto(id)}`).get();
  const foto = snapshot.val();
  return typeof foto === 'string' ? foto : '';
}

export async function gravarFotoBlob(id: string, foto: string) {
  await bancoFirebase().ref(`sistemaGestaoFotos/${chaveFoto(id)}`).set(foto);
}
