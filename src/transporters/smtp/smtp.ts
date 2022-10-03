import { Transporter as ITransporter } from '@/transporters/ITransporter'
import { InfomaniakError } from '@/transporters/smtp/InfomaniakError'
import { SMTPResponse } from '@/transporters/smtp/SMTPResponse'
import { Addressable } from '@/types/interfaces/Addressable'
import { SendingResponse } from '@/classes/sending_response'
import { GmailError } from '@/transporters/smtp/GmailError'
import { Attachment } from '@/types/interfaces/Attachment'
import { MailSender } from '@/types/interfaces/MailSender'
import { SMTPError } from '@/transporters/smtp/SMTPError'
import { Transporter } from '@/transporters/transporter'
import { Buildable } from '@/types/interfaces/Buildable'
import { HTTP_METHOD } from '@/types/enums/http_method'
import { SendingError } from '@/classes/sending_error'
import { Debug } from '@/types/decorators/debug'

export class SmtpTransporter extends Transporter implements ITransporter {
    constructor( transporterEngine: MailSender ) {
      super(transporterEngine);
    }
    @Debug('smtp')
    build({...args }: Buildable): Record<string,unknown> {
        const { payload, body } = args
        const output = {
            from: this.address(payload.meta.from),
            to: this.addresses(payload.meta.to),
            replyTo: this.address(payload.meta.replyTo),
            subject: payload.meta.subject
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
        Object.assign(output, {
            text: body.text,
            html: body.html
        })
        return output
    }
    address(recipient: string|Addressable): string {
        if (typeof recipient === 'string') {
            return recipient
        }
        return typeof recipient.name !== 'undefined' ? `${recipient.name} <${recipient.email}>` : `<${recipient.email}>`
    }
    addresses(recipients: Array<string|Addressable>): Array<string> {
        return [...recipients].map( (recipient: string|Addressable) => this.address(recipient) )
    }
    response(response: SMTPResponse): SendingResponse {
        const incoming = response
        const res = new SendingResponse()
        return res
        .set('accepted', incoming.accepted)
        .set('uri', null)
        .set('httpVersion', null)
        .set('headers', null)
        .set('method', HTTP_METHOD.POST)
        .set('body', incoming.envelope)
        .set('statusCode', 202)
        .set('statusMessage', incoming.response)
        .set('messageId', incoming.messageId)
    }
    error(error: Error|GmailError|InfomaniakError|SMTPError): SendingError {
        if (error instanceof TypeError) {
            return new SendingError(417, error.name, [error.message])
        }
        if (this.transporter.options.host === 'smtp.gmail.com') {
            error = error as GmailError
            const regError = /[A-Z]{1}[a-z\s\W]+\./g
            const matchError = regError.exec(error.response)[0]
            const regHelp = /https:\/\/[a-z-A-Z0-9\w\.-\/\?\=]+/g
            const matchHelp = regHelp.exec(error.response)[0]
            return new SendingError(error.responseCode, error.code.toString(), [matchError])
        }
        if (this.transporter.options.host === 'mail.infomaniak.com') {
            error = error as InfomaniakError
            return new SendingError(403, error.errno.toString(), [ error.errno.toString() ])
        }
        error = error as SMTPError
        return new SendingError(error.responseCode, error.code.toString(), [error.response])
    }
}