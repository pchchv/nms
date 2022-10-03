import { SendingResponse } from '@/classes/sending_response'
import { MailSender} from '@/types/interfaces/MailSender'
import { Buildable } from '@/types/interfaces/Buildable'
import { SendingError } from '@/classes/sending_error'

export interface Transporter {
    transporter: MailSender
    address: (recipient: any, type?: string) => any
    addresses: (recipients: any, type?: string) => any
    build: ({ ...args }: Buildable) => any
    error: (error: any) => SendingError
    response: (payload: any) => SendingResponse
    sendMail?: (body: any, callback: (err: any, result: any) => void ) => void
}