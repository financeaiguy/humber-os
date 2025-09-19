// Global event system for triggering the Professional Chat widget
class ChatEventEmitter extends EventTarget {
  private static instance: ChatEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): ChatEventEmitter {
    if (!ChatEventEmitter.instance) {
      ChatEventEmitter.instance = new ChatEventEmitter();
    }
    return ChatEventEmitter.instance;
  }

  openChat() {
    this.dispatchEvent(new CustomEvent('open-chat'));
  }

  closeChat() {
    this.dispatchEvent(new CustomEvent('close-chat'));
  }

  toggleChat() {
    this.dispatchEvent(new CustomEvent('toggle-chat'));
  }
}

export const chatEvents = ChatEventEmitter.getInstance();