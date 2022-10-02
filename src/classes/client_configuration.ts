import { Transporter } from '@/types/transporter'
import { Consumer } from '@/classes/consumer'
import { SMTP } from '@/classes/smtp'

class ClientConfiguration {
    sandbox?: {
        active: boolean
        from: {
            name: string
            email: string
        },
        to: {
            name: string
            email: string
        }
    }
    consumer!: Consumer
    mode!: {
        api?: {
            credentials: {
                apiKey: string,
                token?: string
            },
            name: Transporter,
            templates: Array<{[event: string]: string}>
        }
        smtp?: SMTP
    }
    constructor(payload: Record<string,unknown>) {
        Object.assign(this, payload)
    }
}

export { ClientConfiguration }