

import { SendgridResponse } from '@/transporters/sendgrid/SendgridResponse'
import { Transporter as ITransporter } from '@/transporters/ITransporter'
import { Addressable } from @'/types/interfaces/addresses/Addressable'
import { SendgridError } from '@/transporters/sendgrid/SendgridError'
import { AddressB } from '@/types/interfaces/addresses/AddressB'
import { SendingResponse } from '@/classes/sending_response'
import { MailSender } from '@/types/interfaces/MailSender'
import { Buildable } from '@/types/interfaces/Buildable'
import { Transporter } from '@/transporters/transporter'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'
import { Debug } from '@/types/decorators/debug'

export class SendgridTransporter extends Transporter implements ITransporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    @Debug('sendgrid')
    build({...args}: Buildable): Record<string,unknown> {
        const { payload, templateId, body } = args
        const output = {
            from: this.address(payload.meta.from, 'from'),
            personalizations: [{
                to: this.addresses(payload.meta.to),
            }],
            to: this.addresses(payload.meta.to),
            reply_to: this.address(payload.meta.replyTo),
            subject: payload.meta.subject
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output, {
                    dynamic_template_data: payload.data,
                    templateId: payload.meta.templateId || templateId
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
            Object.assign(output.personalizations, { cc: this.addresses(payload.meta.cc) })
        }
        if (typeof(payload.meta.bcc) !== 'undefined') {
            Object.assign(output.personalizations, { bcc: this.addresses(payload.meta.bcc) })
        }
        if (typeof(payload.meta.attachments) !== 'undefined') {
            Object.assign(output, { attachments: payload.meta.attachments })
        }
        return output
    }
    address(recipient: string|Addressable, type?: string): string|AddressB {
        if (typeof recipient === 'string') {
            return type === 'from' ? recipient : { email: recipient }
        }
        return type === 'from' ? recipient.email : { email: recipient.email, name: recipient.name }
    }
    addresses(recipients: Array<string|Addressable>): Array<string|AddressB> {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient) )
    }
    response(response: SendgridResponse[]): SendingResponse {
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
    error(error: SendgridError): SendingError {
        return new SendingError(error.code || error.statusCode, error.name || error.message, error.hasOwnProperty('response') ? error.response.body.errors : [error.message])
    }
}