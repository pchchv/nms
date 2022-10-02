import { Addressable } from "@/types/interfaces/Addressable"
import { Attachment } from "@/types/interfaces/Attachment"
import { Buffer } from "@/types/interfaces/Buffer"
import { Compiler } from "@/types/compiler"

export interface Payload {
    compiler?: Compiler
    meta: {
        templateId?: string
        from?: Addressable
        to: Array<string> | Array<Addressable>
        replyTo?: Addressable
        subject: string
        cc?: Array<string|Addressable>
        bcc?: Array<string|Addressable>
        attachments?: Array<Attachment>
        inlineImages?: Array<Attachment>
    }
    
    data?: Record<string,unknown>
    content?: Buffer[]
}