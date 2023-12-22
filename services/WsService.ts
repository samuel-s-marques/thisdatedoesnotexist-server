import { WebSocketServer } from 'ws'

class WsService {
  public wss: WebSocketServer
  private booted = false

  public boot() {
    if (this.booted) {
      return
    }

    this.booted = true
    this.wss = new WebSocketServer({
      port: 7778,
    })
  }
}

export default new WsService()
