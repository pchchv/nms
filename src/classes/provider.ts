import { Transporter } from '@/types/transporter'

export class Provider {
    name!: Transporter
    credentials!: {
        key: string
        token: string
    }
    templates: any
    domains!: string[]
    constructor(payload: Record<string,unknown>) {
        Object.assign(this, payload)
    }
}