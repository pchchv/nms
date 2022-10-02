export class Consumer {
    domain!: string
    company?: string
    addresses?: {
        from?: {
            name: string,
            email: string
        },
        replyTo?: {
            name: string,
            email: string
        }
    }
    location?: {
        street: string
        num: string
        city: string
        zip: string
        country: string
    }
    email?: string
    phone?: string
    socials?: Array<{ name: string, url: string, icon: string }>
    theme?: {
        logo: string
        primaryColor: string
        secondaryColor: string
        tertiaryColor: string
        quaternaryColor: string
    }
    constructor() {}
}