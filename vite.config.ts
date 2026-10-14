import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { gravarNuvemKv, lerNuvemKv } from './lib/nuvemKv'
import { gravarFotoBlob, lerFotoBlob } from './lib/nuvemFoto'
import { baixarBufferAnexo, gravarAnexoBytes, gravarAnexoPdf, lerUrlAnexo } from './lib/nuvemAnexo'
import { responderCeasa } from './lib/ceasaArquivos'

const VARIAVEIS_NUVEM = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_DATABASE_URL', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'BLOB_READ_WRITE_TOKEN', 'XAI_API_KEY', 'XAI_MODEL']

const carregarTokenBlob = () => {
  const caminho = resolve(process.cwd(), '.env.local')
  if (!existsSync(caminho)) return
  const conteudo = readFileSync(caminho, 'utf8')
  for (const nome of VARIAVEIS_NUVEM) {
    if (process.env[nome]) continue
    const linha = conteudo.match(new RegExp(`^${nome}=(.*)$`, 'm'))
    if (linha) process.env[nome] = linha[1].trim().replace(/^["']|["']$/g, '')
  }
}

const nuvemLocal = (): Plugin => ({
  name: 'nuvem-local',
  configureServer(server) {
    server.middlewares.use('/api/nuvem', async (req, res) => {
      const enviar = (status: number, corpo: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(corpo))
      }
      carregarTokenBlob()
      try {
        if (req.method === 'GET') {
          const desde = new URL(req.url || '', 'http://localhost').searchParams.get('desde') || ''
          return enviar(200, await lerNuvemKv(desde))
        }
        if (req.method === 'PUT') {
          const pedacos: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (parte) => pedacos.push(parte as Buffer))
            req.on('end', () => resolve())
            req.on('error', reject)
          })
          const texto = Buffer.concat(pedacos).toString('utf8') || '{}'
          const resultado = await gravarNuvemKv(JSON.parse(texto))
          return enviar('conflito' in resultado ? 409 : 200, resultado)
        }
        return enviar(405, { erro: 'Método não permitido.' })
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Falha ao falar com a nuvem.'
        return enviar(/sem configuração/i.test(mensagem) ? 503 : 500, { erro: mensagem })
      }
    })
    server.middlewares.use('/api/foto', async (req, res) => {
      const enviar = (status: number, corpo: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(corpo))
      }
      carregarTokenBlob()
      try {
        if (req.method === 'GET') {
          const id = new URL(req.url || '', 'http://localhost').searchParams.get('id') || ''
          if (!id) return enviar(400, { erro: 'Foto sem identificação.' })
          const foto = await lerFotoBlob(id)
          return enviar(foto ? 200 : 404, { foto })
        }
        if (req.method === 'PUT') {
          const pedacos: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (parte) => pedacos.push(parte as Buffer))
            req.on('end', () => resolve())
            req.on('error', reject)
          })
          const corpo = JSON.parse(Buffer.concat(pedacos).toString('utf8') || '{}') as { id?: string; foto?: string }
          if (!corpo.id || !corpo.foto) return enviar(400, { erro: 'Foto inválida.' })
          await gravarFotoBlob(corpo.id, corpo.foto)
          return enviar(200, { ok: true })
        }
        return enviar(405, { erro: 'Método não permitido.' })
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Falha ao gravar foto.'
        return enviar(/sem configuração/i.test(mensagem) ? 503 : 500, { erro: mensagem })
      }
    })
    server.middlewares.use('/api/anexo', async (req, res) => {
      const enviar = (status: number, corpo: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(corpo))
      }
      carregarTokenBlob()
      try {
        if (req.method === 'GET') {
          const busca = new URL(req.url || '', 'http://localhost').searchParams
          const id = busca.get('id') || ''
          if (!id) return enviar(400, { erro: 'Anexo sem identificação.' })
          if (busca.get('arquivo') === '1') {
            const arquivo = await baixarBufferAnexo(id)
            if (!arquivo) return enviar(404, { erro: 'PDF não encontrado na nuvem.' })
            const nome = String(busca.get('nome') || 'anexo.pdf').replace(/[^\w.\- ()áéíóúãõçÁÉÍÓÚÃÕÇ]/g, '_')
            const baixar = busca.get('baixar') === '1'
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `${baixar ? 'attachment' : 'inline'}; filename="${nome}"`)
            res.end(arquivo)
            return
          }
          try {
            const url = await lerUrlAnexo(id)
            return enviar(url ? 200 : 404, { url })
          } catch {
            return enviar(404, { url: '' })
          }
        }
        if (req.method === 'PUT') {
          const pedacos: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (parte) => pedacos.push(parte as Buffer))
            req.on('end', () => resolve())
            req.on('error', reject)
          })
          const bruto = Buffer.concat(pedacos)
          const buscaPut = new URL(req.url || '', 'http://localhost').searchParams
          const tipo = String(req.headers['content-type'] || '')
          let idPut = buscaPut.get('id') || ''
          let url = ''
          if (tipo.includes('application/pdf') || tipo.includes('application/octet-stream')) {
            if (!idPut) return enviar(400, { erro: 'Anexo sem identificação.' })
            url = await gravarAnexoBytes(idPut, bruto)
          } else {
            const corpo = JSON.parse(bruto.toString('utf8') || '{}') as { id?: string; conteudo?: string }
            idPut = idPut || String(corpo.id || '')
            if (!idPut || !corpo.conteudo) return enviar(400, { erro: 'PDF inválido.' })
            url = await gravarAnexoPdf(idPut, corpo.conteudo)
          }
          return enviar(200, { ok: true, url })
        }
        return enviar(405, { erro: 'Método não permitido.' })
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Falha ao gravar o PDF.'
        return enviar(500, { erro: mensagem })
      }
    })
    server.middlewares.use('/api/ceasa', async (req, res) => {
      carregarTokenBlob()
      const pedacos: Buffer[] = []
      await new Promise<void>((resolve, reject) => {
        req.on('data', (parte) => pedacos.push(parte as Buffer))
        req.on('end', () => resolve())
        req.on('error', reject)
      })
      const bruto = Buffer.concat(pedacos)
      let body: unknown = undefined
      if (bruto.length) {
        try { body = JSON.parse(bruto.toString('utf8')) } catch { body = {} }
      }
      const headers: Record<string, string | undefined> = {}
      for (const [chave, valor] of Object.entries(req.headers)) {
        headers[chave] = Array.isArray(valor) ? valor[0] : valor
      }
      const resultado = await responderCeasa({
        method: req.method || 'GET',
        url: req.url || '',
        headers,
        body
      })
      if (resultado.tipo === 'pdf') {
        res.statusCode = resultado.status
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${resultado.nome}"`)
        res.end(resultado.corpo)
        return
      }
      res.statusCode = resultado.status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(resultado.corpo))
    })
  }
})

export default defineConfig({
  plugins: [react(), tailwindcss(), nuvemLocal()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/Trae/**', '**/PearAI/**', '**/Devin/**', '**/cursor/**', '**/dist/**', '**/.git/**', '**/src/backup/**']
    }
  }
})
