import { SendingResponse } from '@/classes/sending_response'
import { SendingError } from '@/classes/sending_error'
import { Payload } from '@/types/interfaces/Payload'
import { Mailer } from '@/services/mailer'

export class Subscriber {
    event: string
    constructor(event: string) {
        this.event = event
    }
    async handler(event: string, payload: Payload, origin?: string): Promise<SendingResponse|SendingError> {
        return Mailer.send(event, payload)
    }
}