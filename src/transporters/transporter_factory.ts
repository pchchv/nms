import * as sendinblueTransport from 'nodemailer-sendinblue-v3-transport'
import * as sparkpostTransport from 'nodemailer-sparkpost-transport'
import * as mandrillTransport from 'nodemailer-mandrill-transport'
import * as postmarkTransport from 'nodemailer-postmark-transport'
import * as mailgunTransport from 'nodemailer-mailgun-transport'
import * as sendgridTransport from 'nodemailer-sendgrid'
import * as mailjetTransport from 'node-mailjet'
import { createTransport } from 'nodemailer'
import { SendinblueTransporter } from '@/transporters/sendinblue/sendinblue'
import { SparkpostTransporter } from '@/transporters/sparkpost/sparkpost'
import { SendgridTransporter } from '@/transporters/sendgrid/sendgrid'
import { MandrillTransporter } from '@/transporters/mandrill/mandrill'
import { PostmarkTransporter } from '@/transporters/postmark/postmark'
import { MailgunTransporter } from '@/transporters/mailgun/mailgun'
import { Transporter as TransporterType} from '@/types/transporter'
import { MailjetTransporter } from '@/transporters/mailjet/mailjet'
import { SendingResponse } from '@/classes/sending_response'
import { SmtpTransporter } from '@/transporters/smtp/smtp'
import { Transporter } from '@/transporters/transporter'
import { TRANSPORTER } from '@/types/enums/transporter'
import { SendingError } from '@/classes/sending_error'
import { SMTP } from '@/classes/smtp'

export class TransporterFactory {
    private static engine = null
    constructor() {}
    static get(key: TransporterType, { ...args }: { apiKey?: string, token?: string, smtp?: SMTP, domain?: string } ): Transporter {
        switch(key) {
            case TRANSPORTER.mailgun:
                TransporterFactory.engine = mailgunTransport({
                    auth: {
                        api_key: args.apiKey,
                        domain: args.domain
                    }
                }) as unknown
                return new MailgunTransporter( createTransport( TransporterFactory.engine ) )
                case TRANSPORTER.mailjet:
                    TransporterFactory.engine = mailjetTransport.connect(args.apiKey, args.token)
                    TransporterFactory.engine.sendMail = (payload: any, callback: (err?: Error, result?: Record<string,unknown>) => void): Promise<SendingResponse|SendingError> => {
                        return TransporterFactory.engine
                        .post('send', { version : 'v3.1' })
                        .request(payload)
                        .then( (result: any) => {
                            callback(null, result)
                        })
                        .catch( (error: any) => {
                            callback(error, null)
                        })
                    }
                    return new MailjetTransporter(TransporterFactory.engine)
                    case TRANSPORTER.mandrill:
                        TransporterFactory.engine = mandrillTransport({
                            auth : {
                                apiKey: args.apiKey
                            }
                        }) as unknown
                        return new MandrillTransporter( createTransport( TransporterFactory.engine ) )
                        case TRANSPORTER.postmark:
                            TransporterFactory.engine = postmarkTransport({
                                auth: {
                                    apiKey: args.apiKey
                                }
                            }) as unknown
                            return new PostmarkTransporter( createTransport( TransporterFactory.engine ) )
                            case TRANSPORTER.sendgrid :
                                TransporterFactory.engine = sendgridTransport({
                                    apiKey: args.apiKey
                                }) as unknown
                                return new SendgridTransporter( createTransport( TransporterFactory.engine ) )
                                case TRANSPORTER.sendinblue:
                                    TransporterFactory.engine = sendinblueTransport({
                                        apiKey: args.apiKey,
                                        apiUrl: 'https://api.sendinblue.com/v3/smtp'
                                    }) as unknown
                                    return new SendinblueTransporter( createTransport( TransporterFactory.engine ) )
                                    case TRANSPORTER.smtp :
                                        TransporterFactory.engine = ((options) => {
                                            return createTransport( {
                                                host: options.host,
                                                port: options.port,
                                                secure: options.secure,
                                                auth: {
                                                    user: options.username,
                                                    pass: options.password
                                                },
                                                greetingTimeout: 5000,
                                                socketTimeout: 5000
                                            } ) as unknown
                                        })(args.smtp)
                                        return new SmtpTransporter(TransporterFactory.engine)
                                        case TRANSPORTER.sparkpost :
                                            TransporterFactory.engine = sparkpostTransport({
                                                sparkPostApiKey: args.apiKey,
                                                options: {
                                                    open_tracking: true,
                                                    click_tracking: true,
                                                    transactional: true
                                                }
                                            }) as unknown
                                            return new SparkpostTransporter( createTransport( TransporterFactory.engine ) )
        }
    }
}