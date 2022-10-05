import { Attachment } from '@/types/interfaces/Attachment'

export interface PostmarkBody {
    from: string
    to: Array<string>
    replyTo: string
    subject: string
    templateModel?: Record<string,unknown>
    templateId?: string
    text?: string
    html?: string
    cc?: Array<string>
    bcc?: Array<string>
    attachments?: Array<Attachment>
}