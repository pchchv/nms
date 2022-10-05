import { AnySchema } from 'joi'
import * as Joi from 'joi'

const name = (): AnySchema => {
    return Joi.string().max(32)
}

export { name }