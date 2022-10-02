import { Payload } from '@/types/interfaces/Payload'

export interface Buildable {
    payload: Payload
    templateId: string
    body: { text: string, html: string }
    origin: string
}