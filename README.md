# **nms**

<div align="center">

# **Node Mail Sender**

## *Agnostic transactional email sending in Node.js environment*

</div>

## **Implementation**

```javasrcipt
import { NMS } from 'nms'
  
NMS.emit('user.confirm', payload)
  .then(res => {
    console.log('Email has been delivered: ', res);
  })
  .catch(err => {
    console.log('Error while mail sending: ', err)
  })
```
