import type {Input} from "../../../core/input"
import {CompilationUnit, type ICompilable} from "../../common/compilation-units"
import {ImportBuilder} from "../../common/import-builder"

export class ExpressServerBuilder implements ICompilable {
  private readonly code: string

  constructor(
    private readonly filename: string,
    private readonly name: string,
    private readonly input: Input,
    private readonly imports: ImportBuilder = new ImportBuilder(),
  ) {
    this.imports
      .from("express")
      .add("Express", "Request", "Response", "NextFunction")

    this.imports.from("http").add("Server")

    this.code = this.buildCode()
  }

  private buildCode(): string {
    return `
export interface ServerConfig {
  port?: number
  host?: string
  middleware?: Array<(app: Express) => void>
  router: Router
  errorHandler?: (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void
}

export function createServer(config: ServerConfig): Express {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  if (config.middleware) {
    config.middleware.forEach(middleware => middleware(app))
  }

  app.use(config.router)

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (config.errorHandler) {
      config.errorHandler(err, req, res, next)
    } else {
      console.error(err)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })

  return app
}

export function bootstrap(config: ServerConfig): Server {
  const app = createServer(config)
  const port = config.port || process.env.PORT || 3000
  const host = config.host || process.env.HOST || 'localhost'

  const server = app.listen(port, () => {
    console.log(\`Server listening at http://\${host}:\${port}\`)
  })

  return server
}
`
  }

  toString(): string {
    return this.code
  }

  toCompilationUnit(): CompilationUnit {
    return new CompilationUnit(this.filename, this.imports, this.code)
  }
}
