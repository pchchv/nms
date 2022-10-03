import * as Joi from 'joi'
import { AnySchema } from 'joi'
import { host } from '@/types/schemas/host'
import { port } from '@/types/schemas/port'
import { username } from '@/types/schemas/username'
import { password } from '@/types/schemas/password'


const smtp = (): AnySchema => {
    return Joi.object({
      host: host('smtp').required(),
      port: port().required(),
      secure: Joi.boolean().default(false),
      username: username().required(),
      password: password('smtp').required(),
    });
  };
  
  export { smtp };