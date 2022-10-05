export interface MailjetError {
    response: {
        res: {
            text: string
        }
    },
    statusCode: number,
    ErrorMessage: string
}