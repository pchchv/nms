import { TransporterFactory } from '@/transporters/transporter_factory'
import { ClientConfiguration } from '@/classes/client_configuration'
import { configurationSchema } from '@/validations/configuration'
import { Transporter } from '@/transporters/transporter'
import { existsSync, readFileSync } from 'fs'
import * as Chalk from 'chalk'


class Container {
    private static instance: Container
    public configuration!: ClientConfiguration
    public transporter!: Transporter
    private readonly PATH: string = `${process.cwd()}/.cliamrc.json`
    private constructor() {}
    static get(): Container {
        if (!Container.instance) {
            Container.instance = new Container()
        }
        return Container.instance.set()
    }
    private set(): Container {
        this.configuration = new ClientConfiguration( this.validates( this.read(this.PATH) ) )
        const params = Object.assign( { domain: this.configuration.consumer.domain }, {
            apiKey: this.configuration.mode?.api?.credentials?.apiKey,
            token: this.configuration.mode?.api?.credentials?.token,
            smtp: this.configuration.mode?.smtp
        })
        this.transporter = TransporterFactory.get(this.configuration.mode?.api?.name || 'smtp', params)
        return this
    }
    private read(path: string): Record<string,unknown> {
        if (!existsSync(path)) {
            process.stdout.write( Chalk.bold.red('.cliamrc.json file cannot be found\n') )
            process.exit(0)
        }
        const content = readFileSync(path, { encoding: 'utf-8' })
        if (!content) {
            process.stdout.write( Chalk.bold.red('.cliamrc.json content not found\n') )
            process.exit(0)
        }
        return JSON.parse(content) as Record<string,unknown>
    }
    private validates(configuration: Record<string,unknown>): Record<string,unknown> {
        const error = configurationSchema.validate(configuration, { abortEarly: true, allowUnknown: false })?.error
        if (error) {
            process.stdout.write( Chalk.bold.red(`Error in .cliamrc.json: ${error.details.shift().message}\n`) )
            process.exit(0)
        }
        return configuration
    }
}

const service = Container.get()
export { service as Container }