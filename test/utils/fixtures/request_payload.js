const { base64Encode } = require( process.cwd() + '/lib/utils/string.util' )
module.exports = (compiler = 'provider') => {
    return {
        meta: {
            subject: 'Hello, I\'m an email',
            to: [
                {
                    email: process.env.EMAIL_TO,
                    name: 'John Doe',
                }
            ],
            from: {
                email: process.env.EMAIL_FROM,
                name : 'Edgar Allan Poe'
            },
            replyTo: {
                email: process.env.EMAIL_REPLY_TO,
                name : 'No reply too'
            },
            cc: [
                {
                    name: 'George Moe',
                    email: 'george@example.com'
                }
            ],
            bcc: [
                {
                    name: 'Robert Poe',
                    email: 'george@example.com'
                }
            ],
            attachments: [
                {
                    content: base64Encode( process.cwd() + '/test/utils/fixtures/files/javascript.jpg' ),
                    type: 'image/jpg',
                    filename: 'javascript.jpg',
                    disposition: 'attachment'
                }
            ]
        },
        content: [{
            type: 'text/html',
            value: '<h1>Hello Yoda</h1><p>I use Cliam to send my emails !</p>'
        }],
        data: {}
    }
}