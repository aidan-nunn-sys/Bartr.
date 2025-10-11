import ApiService from './api.service.js';

class MessagesService {
    static async sendMessage(payload) {
        return ApiService.post('/messages', payload);
    }

    static async fetchInbox() {
        return ApiService.get('/messages/inbox');
    }

    static async fetchSent() {
        return ApiService.get('/messages/sent');
    }

    static async fetchThread(listingId, participantId = null) {
        const params = new URLSearchParams();
        if (participantId) {
            params.set('participantId', participantId);
        }
        const query = params.toString();
        const endpoint = query ? `/messages/listing/${listingId}?${query}` : `/messages/listing/${listingId}`;
        return ApiService.get(endpoint);
    }

    static async markAsRead(messageId) {
        return ApiService.put(`/messages/${messageId}/read`);
    }

    static async deleteMessage(messageId) {
        return ApiService.delete(`/messages/${messageId}`);
    }

    static async getUnreadCount() {
        return ApiService.get('/messages/unread/count');
    }
}

export default MessagesService;
