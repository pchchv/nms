import { MandrillResponse } from '@/transporters/mandrill/MandrillResponse'
import { Transporter as ITransporter } from '@/transporters/ITransporter'
import { AddressB } from '@/types/interfaces/addresses/AddressB'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { Buildable } from '@/types/interfaces/Buildable'
import { Transporter } from '@/transporters/transporter'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'

export class MandrillTransporter extends Transporter implements ITransporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    build({...args}: Buildable): Record<string,unknown> {
        const { payload, templateId, body } = args
        const output = {
            message: {
                subject: payload.meta.subject,
                from_email: this.address(payload.meta.from.email, 'single'),
                from_name: payload.meta.from.name,
                to: this.addresses(payload.meta.to, 'to'),
                headers: {
                    'Reply-To': this.address(payload.meta.replyTo, 'single')
                },
                track_opens: true,
                track_click: true,
                preserve_recipients: true
            }
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output, {
                    template_content: [payload.data],
                    template_name: payload.meta.templateId || templateId
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
            output.message.to = [].concat(output.message.to).concat(this.addresses(payload.meta.cc, 'cc')) as Array<string|AddressB>
        }
        if (typeof(payload.meta.bcc) !== 'undefined') {
            output.message.to = [].concat(output.message.to).concat(this.addresses(payload.meta.bcc, 'bcc')) as Array<string|AddressB>
        }
        if (typeof(payload.meta.attachments) !== 'undefined') {
            Object.assign(output.message, { attachments: payload.meta.attachments.map( (attachment: Attachment) => {
                return { type: attachment.type, name: attachment.filename, content: attachment.content }
            })})
        }
        return output
    }
    address(recipient: string|Addressable, type?: string): string|AddressB {
        if (typeof recipient === 'string') {
            return recipient
        }
        if (type === 'single') {
            return recipient.email
        }
        return typeof recipient.name !== 'undefined' ? { email: recipient.email, name: recipient.name, type } : { email: recipient.email }
    }
    addresses(recipients: Array<string|Addressable>, type?: string): Array<string|AddressB> {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient, type) )
    }
    response(response: MandrillResponse[]): SendingResponse {
        const incoming = response.shift()
        const res = new SendingResponse()
        res
        .set('uri', incoming.request.uri)
        .set('httpVersion', incoming.httpVersion)
        .set('headers', incoming.headers)
        .set('method', incoming.request.method)
        .set('body', incoming.request.body)
        .set('statusCode', 202)
        .set('statusMessage', incoming.statusMessage)
        return res
    }
    error(error: Error): SendingError {
        return new SendingError(500, '', [''])
    }
}