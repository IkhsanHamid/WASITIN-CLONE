/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/func-call-spacing */
import 'dotenv/config'
import express, { type Application } from 'express'
import { routes } from './routes'
import { logger } from './config/logger'
import bodyParser from 'body-parser'
import cors from 'cors'

// swagger
import swaggerUI from 'swagger-ui-express'
import docs from '../apidocs.json'

// import logErrMonitorMiddleware from './middleware/api-log'
import deserializedToken from './middleware/deserialirizedToken'
import prisma, { connectPrisma } from './config/prisma'
import { errorHandler } from './middleware/error-handler'

const swaggerUICss = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css'
const app: Application = express()
const port: any = process.env.PORT ?? 3100

// swagger config
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(docs, {
    customCss:
      '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: swaggerUICss
  })
)

// parse body request
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// cors access handler
app.use(cors())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  next()
})

app.use(deserializedToken)
// if (process.env.NODE_ENV === 'production') app.use(logErrMonitorMiddleware)

routes(app)

// Connect to Prisma and log the connection status
;(async () => {
  try {
    await connectPrisma()
    logger.info('Connected to the database')
    app.listen(port, () => {
      logger.info(`Server is listening on port ${port}`)
    })
  } catch (error) {
    console.log('error', error)
    logger.error('Error connecting to the database: ', error)
    process.exit(1)
  }
})()

app.use(errorHandler)
