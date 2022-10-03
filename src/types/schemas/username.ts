import { AnySchema } from 'joi'
import * as Joi from 'joi'

const username = (): AnySchema => {
    return Joi.string().max(32)
}

export { username }