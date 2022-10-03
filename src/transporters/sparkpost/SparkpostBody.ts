import { AddressB } from '@/types/interfaces/addresses/AddressB'
import { AddressD } from '@/types/interfaces/addresses/AddressD'
import { Attachment } from '@/types/interfaces/Attachment'

export interface SparkpostBody {
    content: {
        attachments?: Attachment[]
        headers?: {
            CC?: string[]
        },
        from: AddressB
        html?: string
        reply_to: string
        subject: string
        template_id?: string
        text?: string
        use_draft_template?: boolean
    },
    recipients: AddressD[]
    substitution_data?: Record<string,unknown>
}