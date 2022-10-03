import { AnySchema } from 'joi'
import * as Joi from 'joi'

const port = (): AnySchema => {
    return Joi.number().port().default(587)
}

export { port }