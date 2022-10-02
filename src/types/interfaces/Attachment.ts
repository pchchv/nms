import { ATTACHMENT_DISPOSITION } from '@/types/enums/attachment_disposition'
import { ATTACHMENT_MIME_TYPE } from '@/types/enums/attachment_mime_type'

export interface Attachment {
    content: string
    type?: ATTACHMENT_MIME_TYPE
    filename: string
    disposition?: ATTACHMENT_DISPOSITION
}