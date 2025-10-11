import AuthService from '../services/auth.service.js';
import MessagesService from '../services/messages.service.js';

class MessagesComponent {
    constructor() {
        this.container = null;
        this.inboxContainer = null;
        this.sentContainer = null;
        this.threadContainer = null;
        this.replyForm = null;
        this.currentUser = AuthService.getCachedUser();
        this.state = {
            inbox: [],
            sent: [],
            activeThread: null,
            conversation: [],
            loading: false,
            error: null
        };

        this.handleReplySubmit = this.handleReplySubmit.bind(this);
    }

    render() {
        const container = document.createElement('div');
        container.className = 'messages-container';
        container.innerHTML = this.getTemplate();

        this.container = container;
        this.inboxContainer = container.querySelector('#messages-inbox');
        this.sentContainer = container.querySelector('#messages-sent');
        this.threadContainer = container.querySelector('#messages-thread');
        this.replyForm = container.querySelector('#messages-reply-form');

        if (this.replyForm) {
            this.replyForm.addEventListener('submit', this.handleReplySubmit);
        }

        if (!this.currentUser) {
            this.renderLoggedOutState();
        } else {
            this.loadMessages();
        }

        return container;
    }

    getTemplate() {
        return `
            <div class="messages-wrapper">
                <a href="/" class="back-button">&lt;</a>
                <div id="messages-title-container"></div>
                
                <div class="messages-content">
                    <div class="messages-sidebar">
                        <h2 class="messages-section-title">Inbox</h2>
                        <div id="messages-inbox" class="messages-list"></div>
                        <h2 class="messages-section-title">Sent</h2>
                        <div id="messages-sent" class="messages-list"></div>
                    </div>
                    <div class="messages-thread-panel">
                        <div id="messages-thread" class="messages-thread"></div>
                        <form id="messages-reply-form" class="messages-reply-form hidden">
                            <textarea id="messages-reply-input" class="form-textarea" rows="3" placeholder="Write a reply..."></textarea>
                            <div class="messages-reply-actions">
                                <button type="submit" class="form-btn form-btn-primary">Send Reply</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoggedOutState() {
        if (!this.container) return;
        this.inboxContainer.innerHTML = `
            <div class="no-results">
                <p>Sign in to view and manage your messages.</p>
                <div style="margin-top: 16px;">
                    <a data-route="/login" class="link-button">Sign in</a>
                    <span style="margin: 0 8px; color: #666;">or</span>
                    <a data-route="/register" class="link-button">Create account</a>
                </div>
            </div>
        `;
        this.sentContainer.innerHTML = '';
        this.threadContainer.innerHTML = '';
        this.replyForm?.classList.add('hidden');
    }

    async loadMessages() {
        if (!this.currentUser) {
            this.renderLoggedOutState();
            return;
        }

        this.inboxContainer.innerHTML = '<div class="loading">Loading inbox...</div>';
        this.sentContainer.innerHTML = '<div class="loading">Loading sent messages...</div>';

        try {
            const [inbox, sent] = await Promise.all([
                MessagesService.fetchInbox(),
                MessagesService.fetchSent()
            ]);

            this.state.inbox = inbox || [];
            this.state.sent = sent || [];

            this.renderMessageLists();

            if (this.state.activeThread) {
                await this.loadConversation(this.state.activeThread.listingId, this.state.activeThread.counterpartId);
            }
        } catch (error) {
            console.error('Failed to load messages', error);
            this.inboxContainer.innerHTML = '<div class="error">Unable to load inbox.</div>';
            this.sentContainer.innerHTML = '<div class="error">Unable to load sent messages.</div>';
        }
    }

    renderMessageLists() {
        this.inboxContainer.innerHTML = this.state.inbox.length ? '' : '<div class="no-results">No messages yet.</div>';
        this.state.inbox.forEach(message => {
            this.inboxContainer.appendChild(this.createMessageCard(message, 'inbox'));
        });

        this.sentContainer.innerHTML = this.state.sent.length ? '' : '<div class="no-results">No sent messages yet.</div>';
        this.state.sent.forEach(message => {
            this.sentContainer.appendChild(this.createMessageCard(message, 'sent'));
        });
    }

    createMessageCard(message, type) {
        const card = document.createElement('div');
        card.className = `message-card ${message.read ? '' : 'unread'}`;
        const counterpart = this.getCounterpart(message);
        const isUnread = !message.read && message.receiverId === this.currentUser?.id;

        card.innerHTML = `
            <div class="message-card-header">
                <span class="message-card-title">${message.listingTitle || 'Listing'}</span>
                <span class="message-card-date">${new Date(message.sentAt).toLocaleString()}</span>
            </div>
            <div class="message-card-meta">
                <span class="message-card-counterpart">${type === 'sent' ? `To: ${message.receiverName}` : `From: ${message.senderName}`}</span>
                ${isUnread ? '<span class="message-card-unread">Unread</span>' : ''}
            </div>
            <div class="message-card-preview">${this.truncateContent(message.content)}</div>
        `;

        card.addEventListener('click', () => {
            this.openConversation({
                listingId: message.listingId,
                listingTitle: message.listingTitle,
                counterpartId: counterpart.id,
                counterpartName: counterpart.name,
                messageId: message.id
            });
        });

        return card;
    }

    truncateContent(content, length = 120) {
        if (!content) return '';
        return content.length > length ? `${content.slice(0, length)}…` : content;
    }

    getCounterpart(message) {
        if (!this.currentUser) {
            return {
                id: message.senderId,
                name: message.senderName
            };
        }

        if (message.senderId === this.currentUser.id) {
            return {
                id: message.receiverId,
                name: message.receiverName
            };
        }

        return {
            id: message.senderId,
            name: message.senderName
        };
    }

    async openConversation(context) {
        this.state.activeThread = context;
        this.highlightActiveConversation();
        await this.loadConversation(context.listingId, context.counterpartId, context.messageId);
    }

    highlightActiveConversation() {
        const cards = this.container.querySelectorAll('.message-card');
        cards.forEach(card => card.classList.remove('active'));
        const { listingId, counterpartId } = this.state.activeThread || {};
        if (!listingId || !counterpartId) {
            return;
        }

        cards.forEach(card => {
            if (card.textContent.includes(this.state.activeThread.listingTitle)) {
                card.classList.add('active');
            }
        });
    }

    async loadConversation(listingId, counterpartId, originatingMessageId = null) {
        if (!this.threadContainer) return;
        this.threadContainer.innerHTML = '<div class="loading">Loading conversation...</div>';

        try {
            const messages = await MessagesService.fetchThread(listingId, counterpartId);
            this.state.conversation = messages || [];
            this.renderConversation();
            if (originatingMessageId) {
                await this.maybeMarkAsRead(originatingMessageId);
            }
        } catch (error) {
            console.error('Failed to load conversation', error);
            this.threadContainer.innerHTML = '<div class="error">Unable to load conversation.</div>';
        }
    }

    async maybeMarkAsRead(messageId) {
        if (!messageId || !this.currentUser) {
            return;
        }
        try {
            const message = this.state.conversation.find(msg => msg.id === messageId);
            if (message && !message.read && message.receiverId === this.currentUser.id) {
                await MessagesService.markAsRead(messageId);
                await this.loadMessages();
            }
        } catch (error) {
            console.warn('Failed to mark message as read', error);
        }
    }

    renderConversation() {
        if (!this.threadContainer) return;
        if (!this.state.activeThread) {
            this.threadContainer.innerHTML = '<div class="no-results">Select a message to view the conversation.</div>';
            this.replyForm?.classList.add('hidden');
            return;
        }

        if (this.state.conversation.length === 0) {
            this.threadContainer.innerHTML = '<div class="no-results">No messages in this conversation yet.</div>';
        } else {
            this.threadContainer.innerHTML = `
                <div class="conversation-header">
                    <h2>${this.state.activeThread.listingTitle}</h2>
                    <p>Conversation with ${this.state.activeThread.counterpartName}</p>
                </div>
                <div class="conversation-messages">
                    ${this.state.conversation.map(message => this.renderConversationMessage(message)).join('')}
                </div>
            `;
            const scrollContainer = this.threadContainer.querySelector('.conversation-messages');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }

        if (this.replyForm) {
            this.replyForm.classList.remove('hidden');
        }
    }

    renderConversationMessage(message) {
        const isCurrentUserSender = this.currentUser && message.senderId === this.currentUser.id;
        return `
            <div class="conversation-message ${isCurrentUserSender ? 'outgoing' : 'incoming'}">
                <div class="conversation-message-meta">
                    <span class="conversation-message-author">${message.senderName}</span>
                    <span class="conversation-message-date">${new Date(message.sentAt).toLocaleString()}</span>
                </div>
                <div class="conversation-message-body">${message.content}</div>
            </div>
        `;
    }

    async handleReplySubmit(event) {
        event.preventDefault();
        if (!this.currentUser || !this.state.activeThread) {
            return;
        }

        const textarea = this.replyForm.querySelector('#messages-reply-input');
        const content = textarea.value.trim();
        if (!content) {
            return;
        }

        try {
            await MessagesService.sendMessage({
                listingId: this.state.activeThread.listingId,
                receiverId: this.state.activeThread.counterpartId,
                content
            });
            textarea.value = '';
            await this.loadConversation(this.state.activeThread.listingId, this.state.activeThread.counterpartId);
            await this.loadMessages();
        } catch (error) {
            console.error('Failed to send message', error);
            alert('Unable to send your message right now. Please try again.');
        }
    }

    destroy() {
        if (this.replyForm) {
            this.replyForm.removeEventListener('submit', this.handleReplySubmit);
        }
        this.container = null;
    }
}

export default MessagesComponent;
