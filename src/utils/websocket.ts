type MessageHandler = (data: any) => void

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private sessionId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private messageHandlers: MessageHandler[] = []
  private shouldReconnect = true

  constructor(url: string, sessionId: string) {
    this.url = url
    this.sessionId = sessionId
  }

  connect() {
    this.shouldReconnect = true
    try {
      console.log('Connecting to WebSocket:', this.url)
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        console.log('📨 WebSocket message received:', event.data)
        try {
          const data = JSON.parse(event.data)
          this.messageHandlers.forEach((handler) => handler(data))
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason || 'No reason provided')
        if (this.shouldReconnect) {
          this.reconnect()
        }
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.reconnect()
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`)
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnect attempts reached')
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler)
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.messageHandlers = []
    }
    console.log('WebSocket manually disconnected')
  }
}

// Create WebSocket instance for login monitoring
export const createLoginWebSocket = (sessionId: string) => {
  // Adjust URL based on your backend WebSocket endpoint
  const wsUrl = `ws://49.235.97.26/auth/ws/${sessionId}`
  console.log('Creating WebSocket with URL:', wsUrl)
  return new WebSocketClient(wsUrl, sessionId)
}
