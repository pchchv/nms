import { MailjetErrorMessage } from '@/transporters/mailjet/MailjetErrorMessage'

const getMailjetErrorMessages = ( input: MailjetErrorMessage[] ): string[] => {
    return input.map( (message: { Errors: { ErrorMessage: string }[] } ) => message.Errors.map( (error: { ErrorMessage: string } ) => error.ErrorMessage ).join(',') )
}

export { getMailjetErrorMessages }