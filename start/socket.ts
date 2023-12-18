import WsService from 'Service/WsService'
import { v4 as uuidv4 } from 'uuid'
WsService.boot()

WsService.wss.on('connection', (ws) => {
  const id = uuidv4()
  ws.send('Hello from AdonisJS')

  ws.on('message', (data, isBinary) => {
    const message = isBinary ? data : data.toString()
    console.log(message)
  })
})
