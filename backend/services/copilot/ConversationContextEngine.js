const contexts = new Map();

export class ConversationContextEngine {
  static async getOrCreateContext(conversationId, tenantId, userRole) {
    if (!contexts.has(conversationId)) {
      contexts.set(conversationId, {
        conversationId,
        tenantId,
        userRole,
        queryId: '',
      });
    }

    return contexts.get(conversationId);
  }

  static updateContext(conversationId, patch) {
    const current = contexts.get(conversationId) || { conversationId };
    contexts.set(conversationId, { ...current, ...patch });
    return contexts.get(conversationId);
  }
}
