import { AnySchema } from 'joi'
import * as Joi from 'joi'

const email = (): AnySchema => {
    return Joi.string().email()
}

export { email }