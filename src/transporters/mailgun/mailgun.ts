import { Transporter as ITransporter } from '@/transporters/ITransporter'
import { MailgunError } from '@/transporters/mailgun/MailgunError'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { Transporter } from '@/transporters/transporter'
import { Buildable } from '@/types/interfaces/Buildable'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'

export class MailgunTransporter extends Transporter implements ITransporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    address(recipient: string|Addressable): string {
        if (typeof recipient === 'string') {
            return recipient
        }
        return typeof recipient.name !== 'undefined' ? `${recipient.name} <${recipient.email}>` : recipient.email
    }
    addresses(recipients: Array<string|Addressable>): Array<string> {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient) )
    }
    build({...args}: Buildable): Record<string,unknown> {
        const { payload, templateId, body } = args
        const output = {
            from: this.address(payload.meta.from),
            to: this.addresses(payload.meta.to),
            'h:Reply-To': this.address(payload.meta.replyTo),
            subject: payload.meta.subject
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output, {
                    'h:X-Mailgun-Variables': JSON.stringify(payload.data),
                    template: templateId
                })
                break
                case COMPILER.default:
                case COMPILER.self:
                    Object.assign(output, {
                        text: body.text,
                        html: body.html
                    })
                    break
        }
        if (typeof(payload.meta.cc) !== 'undefined') {
            Object.assign(output, { cc: this.addresses(payload.meta.cc) })
        }
        if (typeof(payload.meta.bcc) !== 'undefined') {
            Object.assign(output, { bcc: this.addresses(payload.meta.bcc) })
        }
        if (typeof(payload.meta.attachments) !== 'undefined') {
            Object.assign(output, {
                attachments: payload.meta.attachments.map( (attachment: Attachment) => {
                    return {
                        filename: attachment.filename,
                        content: attachment.content,
                        encoding: 'base64'
                    }
                })
            })
        }
        return output
    }
    response(response: Record<string,unknown>): SendingResponse {
        const res = new SendingResponse()
        res
        .set('uri', null)
        .set('httpVersion', null)
        .set('headers', null)
        .set('method', 'POST')
        .set('body', response)
        .set('statusCode', 202)
        .set('statusMessage', response.message as string)
        return res
    }
    error(error: MailgunError): SendingError {
        return new SendingError(error.statusCode, error.name || error.message, [error.message])
    }
}