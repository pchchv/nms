const { expect } = require('chai')
const { writeFileSync } = require('fs')
const { nmsrc, requestPayload } = require(process.cwd() + '/test/utils/fixtures')
const internal =  {
    meta: {
        subject: 'Compiled by consumer and sended by SMTP',
        to: [
            {
                name: 'John Galt',
                email: 'mrGalt@gmail.com'
            }
		],
		from: {
			email: 'ipchchv@gmail.com',
			name : 'Jack'
		},
		replyTo: {
			email: 'no-reply@pchchv.io',
			name : 'Galt'
		}
	},
	content: [{
		type: 'text/html',
		value: '<h1>Hello Yoda</h1><p>I use SMTP transporter</p>'
	}]
}
describe('SMTP', function() {
    let NMS, mockery, nodemailerMock
    beforeEach( () => {
        mockery = require('mockery')
        nodemailerMock = require('nodemailer-mock')
        mockery.enable({
            warnOnUnregistered: false,
        })
        /* Once mocked, any code that calls require('nodemailer') will get our nodemailerMock */
        mockery.registerMock('nodemailer', nodemailerMock)
        writeFileSync(`${process.cwd()}/.nmsrc.json`, JSON.stringify(nmsrc, null, 2), { encoding: 'utf-8' })
        /* IMPORTANT Make sure anything that uses nodemailer is loaded here, after it is mocked just above... */
        NMS = require(process.cwd() + '/lib/classes/nms').NMS
    })
    afterEach( () => {
        nodemailerMock.mock.reset()
        mockery.deregisterAll()
        mockery.disable()
    })
    describe('Default transactions', async() => {
        [
            'default',
            'event.subscribe',
            'event.unsubscribe',
            'event.updated',
            'user.bye',
            'user.confirm',
            'user.contact',
            'user.invite',
            'user.progress',
            'user.survey',
            'user.welcome',
            'order.invoice',
            'order.progress',
            'order.shipped',
            'password.request',
            'password.updated'
        ].forEach( (event, idx) => {
            if (idx === 0) {
                describe('Compilation by client', async () => {
                    it(`202 - ${event}`, async() => {
                        const response = await Cliam.emit(event, internal)
                        const sentMail = nodemailerMock.mock.getSentMail();
                        expect(response.statusCode).to.be.eqls(202)
                        expect(response.statusMessage).to.be.eqls('nodemailer-mock success')
                        expect(sentMail.length).to.be.eqls(1)
                    })
                })
                it(`417 - ${event}`, async() => {
                    nodemailerMock.mock.setShouldFailOnce()
                    nodemailerMock.mock.setFailResponse(new TypeError())
                    const params = requestPayload()
                    delete params.content
                    await NMS.emit(event, params).catch(err => {
                        expect(err).to.be.an('object');
                        expect(err).to.haveOwnProperty('statusCode')
                        expect(err).to.haveOwnProperty('statusText')
                        expect(err).to.haveOwnProperty('errors')
                        expect(err.statusCode).to.be.eqls(417)
                    })
                })
            }
            it(`202 - ${event}`, async() => {
                const params = JSON.parse( JSON.stringify( requestPayload() ) )
                delete params.content
                const response = await NMS.emit(event, params)
                const sentMail = nodemailerMock.mock.getSentMail()
                expect(response.statusCode).to.be.eqls(202)
                expect(response.statusMessage).to.be.eqls('nodemailer-mock success')
                expect(sentMail.length).to.be.eqls(1)
            })
        })
    })
})