import { ClientConfiguration } from '@/classes/client_configuration'
import { SendingResponse } from '@/classes/sending_response'
import { SendingError } from '@/classes/sending_error'
import { Payload } from '@/types/interfaces/Payload'
import { Subscriber } from '@/services/subscriber'
import { Event } from '@/types/event'

class Emitter {
    private static instance: Emitter
    private subscribers: Subscriber[] = []
    private configuration: ClientConfiguration
    private constructor(configuration: ClientConfiguration) {
        this.configuration = configuration
    }

    static get(configuration: ClientConfiguration): Emitter {
        if (!Emitter.instance) {
            Emitter.instance = new Emitter(configuration)
        }
        return Emitter.instance
    }

    subscribe(event: Event|string): void {
        if ( this.subscribers.filter(subscriber => subscriber.event === event).length === 0 ) {
            this.subscribers.push( new Subscriber(event) )
        }
    }

    unsubscribe(event: Event|string): void {
        const idx = this.subscribers.findIndex(entry => entry.event === event)
        if (idx) {
            this.subscribers.splice(idx, 1)
        }
    }

    list(event: Event|string): any[] {
        return this.subscribers.filter(subscriber => event ? subscriber.event === event : true).map( subscriber => subscriber.event )
    }

    count(): number {
        return this.subscribers.length
    }

    async emit(event: Event|string, payload: Payload): Promise<SendingResponse|SendingError> {
        return this.subscribers.find(subscriber => subscriber.event === event)?.handler(event, payload)
    }
}

export { Emitter }