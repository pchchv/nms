import { PostmarkError } from '@/transporters/postmark/PostmarkError'
import { PostmarkBody } from '@/transporters/postmark/PostmarkBody'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { Transporter } from '@/transporters/transporter'
import { Buildable } from '@/types/interfaces/Buildable'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'
import { Debug } from '@/types/decorators/debug'

export class PostmarkTransporter extends Transporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    @Debug('postmark')
    build({...args}: Buildable): PostmarkBody {
        const { payload, templateId, body } = args
        const output: PostmarkBody = {
            from: this.address(payload.meta.from),
            to: this.addresses(payload.meta.to),
            replyTo: this.address(payload.meta.replyTo),
            subject: payload.meta.subject
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output, {
                    templateModel: payload.data,
                    templateId: payload.meta.templateId || parseInt(templateId, 10)
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
                        contentTransferEncoding: 'base64',
                        content: attachment.content,
                        filename: attachment.filename,
                        cid: 'cid:' + attachment.filename
                    }
                })
            })
        }
        return output
    }
    address(recipient: string|Addressable): string {
        if (typeof recipient === 'string') {
            return recipient
        }
        return typeof recipient.name !== 'undefined' ? `${recipient.name} ${recipient.email}` : recipient.email
    }
    addresses(recipients: Array<string|Addressable>): Array<string> {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient) )
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
        .set('statusMessage', null)
        return res
    }
    error(error: PostmarkError): SendingError {
        return new SendingError(error.statusCode || error.code, error.name || error.message, error.hasOwnProperty('response') ? error.response.body.errors : [error.message])
    }
}