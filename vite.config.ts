import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      vue(),
      {
        name: 'vercel-api-local-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (!req.url?.startsWith('/api/')) return next()

            const routeMap: Record<string, string> = {
              '/api/webpay-create': './api/webpay-create.js',
              '/api/webpay/create': './api/webpay-create.js',
              '/api/webpay-commit': './api/webpay-commit.js',
              '/api/webpay/commit': './api/webpay-commit.js',
              '/api/send-voucher': './api/send-voucher.js',
              '/api/email/send-voucher': './api/send-voucher.js',
              '/api/health': './api/health.js'
            }

            const cleanPath = req.url.split('?')[0]
            const modulePath = routeMap[cleanPath]
            if (!modulePath) return next()

            try {
              const chunks: Buffer[] = []
              for await (const chunk of req) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
              }
              const rawBody = Buffer.concat(chunks).toString('utf8')
              ;(req as any).body = rawBody ? JSON.parse(rawBody) : {}

              const vercelRes = Object.assign(res, {
                status(code: number) {
                  res.statusCode = code
                  return vercelRes
                },
                json(data: unknown) {
                  if (!res.headersSent) {
                    res.setHeader('Content-Type', 'application/json')
                  }
                  res.end(JSON.stringify(data))
                  return vercelRes
                }
              })

              const mod = await import(modulePath)
              await mod.default(req, vercelRes)
            } catch (err: any) {
              console.error('Local API Middleware Error:', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
            }
          })
        }
      }
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@vue/devtools-kit': fileURLToPath(new URL('./src/shared/lib/devtools-stub.ts', import.meta.url))
      }
    },
    build: {
      cssMinify: false
    }
  }
})

