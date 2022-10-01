export interface MailSender {
    options?: any;
    sendMail: ( body: any, callback: (err: any, result: any) => void ) => void
  }