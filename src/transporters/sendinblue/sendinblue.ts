import { SendinblueResponse } from '@/transporters/sendinblue/SendinblueResponse'
import { AddressB } from '@/types/interfaces/addresses/AddressB'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { Buildable } from '@/types/interfaces/Buildable'
import { Transporter } from '@/transporters/transporter'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'
import { Container } from '@/services/container'

export class SendinblueTransporter extends Transporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    build({...args }: Buildable): Record<string,unknown> {
        const { payload, templateId, body } = args
        const output = {
            headers: {
                'api-key': Container.configuration.mode?.api.credentials.apiKey,
                'content-type': 'application/json',
                'accept': 'application/json'
            },
            to: this.addresses(payload.meta.to),
            from: this.address(payload.meta.from),
            replyTo: this.address(payload.meta.replyTo),
            subject: payload.meta.subject
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output, {
                    params: payload.data,
                    templateId: parseInt(templateId, 10)
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
                        content : attachment.content,
                        filename: attachment.filename,
                        name: attachment.filename
                    }
                })
            })
        }
        return output
    }
    address(recipient: string|Addressable): AddressB {
        if (typeof recipient === 'string') {
            return { email: recipient }
        }
        return recipient as AddressB
    }
    addresses(recipients: Array<string|Addressable>): Array<AddressB> {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient) )
    }
    response(response: SendinblueResponse): SendingResponse {
        const res = new SendingResponse()
        res
        .set('uri', null)
        .set('httpVersion', response.res.httpVersion)
        .set('headers', response.res.headers)
        .set('method', response.res.method)
        .set('body', response.body)
        .set('statusCode', 202)
        .set('statusMessage', response.res.statusMessage)
        return res
    }
    error(error: Error): SendingError {
        const errorCode = /[0-9]+/
        const statusCode = errorCode.exec(error.message)
        return new SendingError(parseInt(statusCode[0], 10), error.name, [error.message])
    }
}