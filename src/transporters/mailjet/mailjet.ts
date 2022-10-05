import { MailjetErrorMessage } from '@/transporters/mailjet/MailjetErrorMessage'
import { Transporter as ITransporter } from '@/transporters/ITransporter'
import { MailjetResponse } from '@/transporters/mailjet/MailjetResponse'
import { MailjetError } from '@/transporters/mailjet/MailjetError'
import { AddressA } from '@/types/interfaces/addresses/AddressA'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { Buildable } from '@/types/interfaces/Buildable'
import { Transporter } from '@/transporters/transporter'
import { getMailjetErrorMessages } from '@/utils/error'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'
import { Debug } from '@/types/decorators/debug'

export class MailjetTransporter extends Transporter implements ITransporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    @Debug('mailjet')
    build({...args}: Buildable): Record<string,unknown> {
        const { payload, templateId, body } = args
        const output = {
            Messages: [{
                From: this.address(payload.meta.from),
                To: this.addresses(payload.meta.to),
                'h:Reply-To': this.address(payload.meta.replyTo),
                Subject: payload.meta.subject
            }]
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output.Messages[0], { Variables: payload.data })
                Object.assign(output.Messages[0], { TemplateLanguage: true })
                Object.assign(output.Messages[0], { TemplateID: parseInt(templateId, 10) })
                break
                case COMPILER.default:
                case COMPILER.self:
                    Object.assign(output.Messages[0], {
                        TextPart: body.text,
                        HTMLPart: body.html
                    })
                    break
        }
        if (typeof(payload.meta.cc) !== 'undefined') {
            Object.assign(output.Messages[0], { Cc: this.addresses(payload.meta.cc) })
        }
        if (typeof(payload.meta.bcc) !== 'undefined') {
            Object.assign(output.Messages[0], { Bcc: this.addresses(payload.meta.bcc) })
        }
        if (typeof(payload.meta.attachments) !== 'undefined') {
            Object.assign(output.Messages[0], {
                Attachments: payload.meta.attachments.map( (attachment: Attachment) => {
                    return {
                        ContentType: attachment.type,
                        Filename: attachment.filename,
                        Base64Content: attachment.content
                    }
                })
            })
        }
        return output
    }
    address(recipient: string|Addressable): AddressA {
        if (typeof recipient === 'string') {
            return { Email: recipient }
        }
        return typeof recipient.name !== 'undefined' ? { Email: recipient.email, Name: recipient.name } : { Email: recipient.email }
    }
    addresses(recipients: Array<string|Addressable>): AddressA[] {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient) )
    }
    response(response: MailjetResponse): SendingResponse {
        const incoming = response.response
        const res = new SendingResponse()
        res
        .set('uri', `${incoming.res.connection.servername} ${incoming.res.req.path}`)
        .set('httpVersion', incoming.res.httpVersion)
        .set('headers', incoming.res.headers)
        .set('method', incoming.req.method)
        .set('body', incoming.body)
        .set('statusCode', 202)
        .set('statusMessage', incoming.res.statusMessage)
        return res
    }
    error(error: MailjetError): SendingError {
        const err = JSON.parse(error.response.res.text) as { ErrorMessage?: string, Messages?: MailjetErrorMessage[] }
        const messages = err.ErrorMessage ? err.ErrorMessage : getMailjetErrorMessages(err.Messages)
        return new SendingError(error.statusCode, error.ErrorMessage, Array.isArray(messages) ? messages: [messages] )
    }
}