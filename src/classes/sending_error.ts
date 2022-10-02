import { Error } from "@/types/interfaces/Error"

export class SendingError implements Error {
    statusCode: number
    statusText: string
    errors: string[]
    
    constructor(status: number, message: string, errors: string[]) {
        this.statusCode = status
        this.statusText = message
        this.errors = errors
    }
}