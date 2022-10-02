import { HTTP_METHOD } from '@/types/enums/http_method'

export interface Sending {
    uri: string
    httpVersion: string
    method: HTTP_METHOD
    headers: Object
    body: Object
    statusCode: number
    statusMessage: string
}