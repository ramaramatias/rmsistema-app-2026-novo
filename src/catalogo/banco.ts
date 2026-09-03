import type { ProdutoCatalogo } from './tipos';

const DB = 'rm-catalogo-produtos';
const STORE = 'produtos';

const abrir = () => new Promise<IDBDatabase>((resolve, reject) => {
  const pedido = indexedDB.open(DB, 1);
  pedido.onupgradeneeded = () => {
    const banco = pedido.result;
    if (!banco.objectStoreNames.contains(STORE)) {
      const tabela = banco.createObjectStore(STORE, { keyPath: 'id' });
      tabela.createIndex('codigo', 'codigo', { unique: false });
      tabela.createIndex('secao', 'secao', { unique: false });
    }
  };
  pedido.onsuccess = () => resolve(pedido.result);
  pedido.onerror = () => reject(pedido.error);
});

export async function listarProdutosCatalogo(): Promise<ProdutoCatalogo[]> {
  const banco = await abrir();
  return new Promise((resolve, reject) => {
    const tx = banco.transaction(STORE, 'readonly');
    const pedido = tx.objectStore(STORE).getAll();
    pedido.onsuccess = () => resolve((pedido.result || []) as ProdutoCatalogo[]);
    pedido.onerror = () => reject(pedido.error);
  });
}

export async function gravarProdutosCatalogo(produtos: ProdutoCatalogo[], substituir: boolean) {
  const banco = await abrir();
  await new Promise<void>((resolve, reject) => {
    const tx = banco.transaction(STORE, 'readwrite');
    const tabela = tx.objectStore(STORE);
    if (substituir) tabela.clear();
    produtos.forEach(produto => tabela.put(produto));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function gravarProdutoCatalogo(produto: ProdutoCatalogo) {
  const banco = await abrir();
  await new Promise<void>((resolve, reject) => {
    const tx = banco.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(produto);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function excluirProdutoCatalogo(id: string) {
  const banco = await abrir();
  await new Promise<void>((resolve, reject) => {
    const tx = banco.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
