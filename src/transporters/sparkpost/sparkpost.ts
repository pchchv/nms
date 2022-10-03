import { Transporter as ITransporter } from '@/transporters/ITransporter' 
import { SparkpostError } from '@/transporters/sparkpost/SparkpostError'
import { SparkpostBody } from '@/transporters/sparkpost/SparkpostBody'
import { AddressD } from '@/types/interfaces/addresses/AddressD'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { Transporter } from '@/transporters/transporter'
import { Buildable } from '@/types/interfaces/Buildable'
import { SendingError } from '@/classes/sending_error'
import { COMPILER } from '@/types/enums/compiler'

export class SparkpostTransporter extends Transporter implements ITransporter {
    constructor( transporterEngine: MailSender ) {
        super(transporterEngine)
    }
    build({...args }: Buildable): SparkpostBody {
        const { payload, templateId, body } = args
        let cc: AddressD[] = []
        let bcc: AddressD[] = []
        const output = {
            recipients: this.addresses(payload.meta.to),
            content: {
                from: payload.meta.from,
                subject: payload.meta.subject,
                reply_to: `${payload.meta.replyTo.name} <${payload.meta.replyTo.email}>`,
            }
        }
        switch(payload.compiler.valueOf()) {
            case COMPILER.provider:
                Object.assign(output, {
                    substitution_data: payload.data,
                })
                Object.assign(output.content, {
                    template_id: templateId,
                    use_draft_template: false
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
            cc = payload.meta.cc.map( (recipient: string|Addressable) => {
                const addr = this.address(recipient)
                const primary = payload.meta.to[0]
                Object.assign(addr, { header_to: typeof primary === 'string' ? primary : primary.email })
                return addr
            })
            output.recipients = [].concat(output.recipients).concat(cc) as AddressD[]
        }
        if (typeof(payload.meta.bcc) !== 'undefined') {
            bcc = payload.meta.bcc.map( (recipient: string|Addressable) => {
                const addr = this.address(recipient)
                const primary = payload.meta.to[0]
                Object.assign(addr, { header_to: typeof primary === 'string' ? primary : primary.email })
                return addr
            })
            output.recipients = [].concat(output.recipients).concat(bcc) as AddressD[]
        }
        if(cc.length > 0 && bcc.length > 0) {
            Object.assign(output.content, {
                headers: {
                    CC: cc.map( (recipient: AddressD) => recipient.email)
                }
            })
        }
        if (typeof(payload.meta.attachments) !== 'undefined') {
            Object.assign(output.content, {
                attachments: payload.meta.attachments.map( (attachment: Attachment) => {
                    return {
                        name: attachment.filename,
                        type: attachment.type,
                        data: attachment.content
                    }
                })
            })
        }
        return output
    }
    address(recipient: string|Addressable): AddressD {
        return { address: recipient }
    }
    addresses(recipients: Array<string|Addressable>): AddressD[] {
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
    error(error: SparkpostError): SendingError {
        return new SendingError(error.statusCode, error.errors[0].message, [ error.errors[0]?.description || '' ])
    }
}