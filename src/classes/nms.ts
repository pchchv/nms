import { SendingResponse } from '@/classes/sending_response'
import { SendingError } from '@/classes/sending_error'
import { Payload } from '@/types/interfaces/Payload'
import { Container } from '@/services/container'
import { Emitter } from '@/services/emitter'
import { Event } from '@/types/event'

class NMS {
    private static instance: NMS
    private emitter: Emitter
    private constructor(emitter: Emitter) {
        this.emitter = emitter
        this.subscribe('default')
        this.subscribe('event.subscribe')
        this.subscribe('event.unsubscribe')
        this.subscribe('event.updated')
        this.subscribe('user.bye')
        this.subscribe('user.confirm')
        this.subscribe('user.contact')
        this.subscribe('user.invite')
        this.subscribe('user.progress')
        this.subscribe('user.survey')
        this.subscribe('user.welcome')
        this.subscribe('order.invoice')
        this.subscribe('order.progress')
        this.subscribe('order.shipped')
        this.subscribe('password.request')
        this.subscribe('password.updated')
    }
    static get(emitter: Emitter): NMS {
        if (!NMS.instance) {
            NMS.instance = new NMS(emitter)
        }
        return NMS.instance
    }
    subscribe(event: Event|string) {
        this.emitter.subscribe(event)
    }
    async emit(event: Event|string, payload: Payload): Promise<SendingResponse|SendingError> {
        return this.emitter.emit(event, payload)
    }
}

const cliam = NMS.get( Emitter.get( Container.configuration ) ) as { emit: (event: Event|string, payload: Payload) =>  Promise<SendingResponse | SendingError>, subscribe: (event: Event|string) => void }

export { cliam as NMS }