import { AnySchema } from 'joi'
import * as Joi from 'joi'

const mimetype = (mimetypes: string[]): AnySchema => {
    return Joi.any().valid(...mimetypes)
}

export { mimetype }