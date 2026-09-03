import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { gravarNuvemBlob, lerNuvemBlob } from './lib/nuvemBlob'
import { gravarFotoBlob, lerFotoBlob } from './lib/nuvemFoto'

const carregarTokenBlob = () => {
  if (process.env.BLOB_READ_WRITE_TOKEN) return
  const caminho = resolve(process.cwd(), '.env.local')
  if (!existsSync(caminho)) return
  const linha = readFileSync(caminho, 'utf8').match(/^BLOB_READ_WRITE_TOKEN=(.*)$/m)
  if (!linha) return
  process.env.BLOB_READ_WRITE_TOKEN = linha[1].trim().replace(/^["']|["']$/g, '')
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
          return enviar(200, await lerNuvemBlob())
        }
        if (req.method === 'PUT') {
          const pedacos: Buffer[] = []
          await new Promise<void>((resolve, reject) => {
            req.on('data', (parte) => pedacos.push(parte as Buffer))
            req.on('end', () => resolve())
            req.on('error', reject)
          })
          const texto = Buffer.concat(pedacos).toString('utf8') || '{}'
          return enviar(200, await gravarNuvemBlob(JSON.parse(texto)))
        }
        return enviar(405, { erro: 'Método não permitido.' })
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Falha ao falar com a nuvem.'
        return enviar(500, { erro: mensagem })
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
        return enviar(500, { erro: mensagem })
      }
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
