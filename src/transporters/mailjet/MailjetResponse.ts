export interface MailjetResponse {
    response: {
        body: Record<string,unknown>,
        res: {
            connection: {
                servername: string
            },
            headers: Record<string,unknown>,
            httpVersion: string,
            statusMessage: string,
            req: {
                path: string
            }
        },
        req: {
            method: string
        }
    }
}