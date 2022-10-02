import { SendingResponse } from '@/classes/sending_response'
import { MailSender } from '@/types/interfaces/MailSender'
import { Buildable } from '@/types/interfaces/Buildable'
import { SendingError } from '@/classes/sending_error'

export abstract class Transporter {
    public transporter: MailSender
    constructor(transporterEngine: MailSender) {
        this.transporter = transporterEngine
    }
    public error(err: any): any {}
    public response(res: any): any {}
    public build({...args }: Buildable): any {}    
    async send(body: Record<string,unknown>): Promise<SendingResponse|SendingError> {
        return new Promise( (resolve, reject) => {
            this.transporter.sendMail( body, (err, info) => {
                if (err) {
                    reject(this.error(err))
                } else {
                    resolve(this.response(info))
                }
            })
        })
    }
}