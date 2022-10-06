const BlockMailer = require(process.cwd() + '/test/utils/blocks/mailer')
describe('API', async () => {
    ['mailgun', 'mailjet', 'postmark', 'sparkpost'].forEach(provider => {
        BlockMailer(provider)
    })
})