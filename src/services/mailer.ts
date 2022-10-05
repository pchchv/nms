import { BUFFER_MIME_TYPE } from '@/types/enums/buffer_mime_type'
import { SendingResponse } from '@/classes/sending_response'
import { Buildable } from '@/types/interfaces/Buildable'
import { Transporter } from '@/transporters/transporter'
import { SendingError } from '@/classes/sending_error'
import { Payload } from '@/types/interfaces/Payload'
import { Buffer } from '@/types/interfaces/Buffer'
import { COMPILER } from '@/types/enums/compiler'
import { Container } from '@/services/container'
import { mailSchema } from '@/validations/mail'
import { Compiler } from '@/services/compiler'


class Mailer {
    private static instance: Mailer
    private transporter: Transporter
    constructor(transporter: Transporter) {
        this.transporter = transporter
    }

    static get(transporter: Transporter): Mailer {
        if(!Mailer.instance) {
            Mailer.instance = new Mailer( transporter )
        }
        return Mailer.instance
    }
    
    send = async (event: string, payload: Payload): Promise<SendingResponse|SendingError> => {
        this.setCompiler(event, payload)
        this.setAddresses(payload)
        const error = mailSchema.validate(payload, { abortEarly: true, allowUnknown: false })?.error
        if (error) {
            return new SendingError(400, 'Validation error', [ error.details.shift().message ])
        }
        return await this.transporter.send( this.transporter.build( this.getBuildable(event, payload) ) )
    }
    
    private setAddresses(payload: Payload): void {
        payload.meta.from = !payload.meta.from ? Container.configuration.consumer?.addresses?.from : payload.meta.from
        payload.meta.replyTo = !payload.meta.replyTo ? Container.configuration.consumer?.addresses?.replyTo : payload.meta.replyTo
    }
    
    private setCompiler(event: string, payload: Payload): void {
        payload.compiler = payload.compiler ? payload.compiler : payload.content ? COMPILER.self : this.getTemplateId(event) ? COMPILER.provider : COMPILER.default
    }
    
    private getBuildable(event: string, payload: Payload): Buildable {
        return {
            payload,
            templateId: payload.compiler === COMPILER.provider ? this.getTemplateId(event) : null,
            body: [ COMPILER.self, COMPILER.default ].includes(payload.compiler as COMPILER) ? this.getCompilated(event, payload) : null,
            origin: this.getOrigin()
        }
    }
    
    private getOrigin(): string {
        return Container.configuration.consumer.domain
    }
    
    private getTemplateId(event: string): string {
        return Container.configuration.mode?.api?.templates[event] as string
    }
    
    private hasPlainText(content: Buffer[]): boolean {
        return content.some( (buffer: Buffer) => buffer.type === BUFFER_MIME_TYPE['text/plain'] && buffer.value )
    }
    
    private getCompilated(event: string, payload: Payload): { html: string, text: string } {
        if (payload.compiler === COMPILER.self && this.hasPlainText(payload.content)) {
            return {
                html: payload.content.find(b => b.type === BUFFER_MIME_TYPE['text/html']).value,
                text: payload.content.find(b => b.type === BUFFER_MIME_TYPE['text/plain']).value,
            }
        }
        if (payload.compiler === COMPILER.self && !this.hasPlainText(payload.content)) {
            return {
                html: payload.content.find(b => b.type === BUFFER_MIME_TYPE['text/html']).value,
                text: Compiler.textify(payload.content.find(b => b.type === BUFFER_MIME_TYPE['text/html']).value),
            }
        }
        return Compiler.compile(event, Object.assign({ subject: payload.meta.subject }, payload.data))
    }
}

const service = Mailer.get( Container.transporter )

export { service as Mailer }