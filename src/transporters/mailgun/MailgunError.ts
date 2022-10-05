export interface MailgunError extends Error {
    name: string
    statusCode: number
    statusText: string
    message: string
}