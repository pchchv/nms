export class SMTP {
    host!: string
    port!: number
    secure!: boolean
    username!: string
    password!: string
    
    constructor(payload: Record<string,unknown>) {
        Object.assign(this, payload)
    }
}