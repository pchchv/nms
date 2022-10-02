import { HTTP_METHOD } from '@/types/enums/http_method'
import { Sending } from '@/types/interfaces/Sending'

export class SendingResponse implements Sending {
    accepted?: string|string[]  
    uri!: string
    httpVersion!: string
    messageId?: string
    method!: HTTP_METHOD
    headers!: object
    body!: Record<string,unknown>
    statusCode!: number
    statusMessage!: string
    
    constructor() {}
    
    set(property: string, value: number|string|string[]|Record<string,unknown>|HTTP_METHOD): SendingResponse {
        this[property] = value
        return this
    }

    get(property: string): number|string|string[]|Record<string,unknown>|HTTP_METHOD {
        return this[property]
    }
}