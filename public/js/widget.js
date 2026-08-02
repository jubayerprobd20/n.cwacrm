(function () {
  // Find current script tag to extract data-org-id
  const scriptTag = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const orgId = scriptTag ? scriptTag.getAttribute('data-org-id') : null;
  if (!orgId) {
    console.error('[N.C WaCRM Widget] Missing data-org-id attribute.');
    return;
  }

  // Fetch host url from script src to construct API request
  const scriptUrl = new URL(scriptTag.src);
  const host = scriptUrl.origin;

  // Fetch widget configuration
  fetch(`${host}/api/public/widget-config?org_id=${orgId}`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load widget config');
      return res.json();
    })
    .then(config => {
      if (!config || !config.is_active) return;
      initWidget(config);
    })
    .catch(err => {
      console.warn('[N.C WaCRM Widget] Initialization failed:', err);
    });

  function initWidget(config) {
    const bubbleText = config.bubble_text || 'Chat with us';
    const welcomeMessage = config.welcome_message || 'Hi! How can we help you today?';
    const agentPhone = config.agent_phone;
    const avatarUrl = config.avatar_url;
    const position = config.position === 'left' ? 'left' : 'right';
    const themeColor = config.theme_color || '#25D366';

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.id = 'ncwacrm-widget-root';
    wrapper.style.position = 'fixed';
    wrapper.style.bottom = '20px';
    wrapper.style[position] = '20px';
    wrapper.style.zIndex = '999999';
    wrapper.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    document.body.appendChild(wrapper);

    // Create shadow root for styles isolation
    const shadow = wrapper.attachShadow({ mode: 'open' });

    // CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .widget-container {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      
      .widget-bubble {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${themeColor};
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
      }
      
      .widget-bubble:hover {
        transform: scale(1.08);
      }
      
      .widget-bubble:active {
        transform: scale(0.95);
      }
      
      .whatsapp-icon {
        width: 32px;
        height: 32px;
        fill: white;
      }
      
      .notification-dot {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        background-color: #EF4444;
        border: 2px solid white;
        border-radius: 50%;
        animation: pulse-dot 2s infinite;
      }
      
      @keyframes pulse-dot {
        0% { transform: scale(0.9); opacity: 0.8; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(0.9); opacity: 0.8; }
      }
      
      .bubble-tooltip {
        position: absolute;
        bottom: 70px;
        background-color: white;
        color: #1F2937;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s, transform 0.3s;
        pointer-events: none;
        box-sizing: border-box;
      }
      
      .bubble-tooltip::after {
        content: '';
        position: absolute;
        bottom: -6px;
        right: 24px;
        border-width: 6px 6px 0;
        border-style: solid;
        border-color: white transparent;
        display: block;
        width: 0;
      }
      
      .widget-bubble:hover .bubble-tooltip {
        opacity: 1;
        transform: translateY(0);
      }
      
      .chat-window {
        width: 340px;
        max-width: 90vw;
        height: 430px;
        background-color: #F3F4F6;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: absolute;
        bottom: 80px;
        right: 0;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        pointer-events: none;
        transition: opacity 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        box-sizing: border-box;
      }
      
      .chat-window.open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      
      .chat-header {
        background-color: ${themeColor};
        color: white;
        padding: 18px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }
      
      .chat-header::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
        pointer-events: none;
      }
      
      .header-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .avatar-wrapper {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .avatar-status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        background-color: #10B981;
        border: 2px solid ${themeColor};
        border-radius: 50%;
      }
      
      .header-text {
        display: flex;
        flex-direction: column;
      }
      
      .agent-name {
        font-size: 15px;
        font-weight: 600;
        line-height: 1.2;
      }
      
      .agent-status {
        font-size: 11px;
        opacity: 0.85;
        margin-top: 2px;
      }
      
      .close-btn {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
        opacity: 0.9;
      }
      
      .close-btn:hover {
        background-color: rgba(255, 255, 255, 0.15);
        opacity: 1;
      }
      
      .chat-body {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background-image: radial-gradient(#dfdfdf 0.75px, transparent 0.75px), radial-gradient(#dfdfdf 0.75px, #f3f4f6 0.75px);
        background-size: 16px 16px;
        background-position: 0 0, 8px 8px;
        display: flex;
        flex-direction: column;
      }
      
      .message-bubble {
        background-color: white;
        color: #1F2937;
        padding: 12px 14px;
        border-radius: 0 12px 12px 12px;
        max-width: 85%;
        font-size: 13.5px;
        line-height: 1.4;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        position: relative;
        align-self: flex-start;
      }
      
      .message-time {
        font-size: 10px;
        color: #9CA3AF;
        text-align: right;
        margin-top: 4px;
      }
      
      .chat-footer {
        background-color: white;
        padding: 10px 12px;
        border-top: 1px solid #E5E7EB;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .chat-input {
        flex: 1;
        border: 1px solid #D1D5DB;
        border-radius: 20px;
        padding: 8px 14px;
        font-size: 13.5px;
        outline: none;
        resize: none;
        height: 20px;
        max-height: 80px;
        line-height: 1.4;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }
      
      .chat-input:focus {
        border-color: ${themeColor};
      }
      
      .send-btn {
        background-color: ${themeColor};
        color: white;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;
        padding: 0;
      }
      
      .send-btn:hover {
        transform: scale(1.05);
      }
      
      .send-btn:active {
        transform: scale(0.95);
      }
      
      .send-icon {
        width: 18px;
        height: 18px;
        fill: white;
        margin-left: 2px;
      }
      
      .branding {
        font-size: 10px;
        color: #9CA3AF;
        text-align: center;
        margin-top: 4px;
        text-decoration: none;
      }
      
      .branding:hover {
        color: #4B5563;
      }
    `;

    shadow.appendChild(style);

    // Structure HTML
    const container = document.createElement('div');
    container.className = 'widget-container';

    // Bubble button
    const bubble = document.createElement('div');
    bubble.className = 'widget-bubble';

    // pulsating notification dot
    const dot = document.createElement('div');
    dot.className = 'notification-dot';
    bubble.appendChild(dot);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'bubble-tooltip';
    tooltip.textContent = bubbleText;
    if (position === 'left') {
      tooltip.style.left = '70px';
      tooltip.style.right = 'auto';
      tooltip.style.transform = 'translateY(10px)';
      tooltip.style.setProperty('--tooltip-arrow', 'left');
    }
    bubble.appendChild(tooltip);

    // WhatsApp Icon
    bubble.innerHTML += `
      <svg class="whatsapp-icon" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.638 2.003 14.162.98 11.53.98c-5.437 0-9.862 4.371-9.866 9.8.001 1.762.485 3.479 1.402 5.004l-.993 3.628 3.784-.984zm11.087-6.834c.307-.154.512-.228.615-.385.102-.157.102-.912-.154-1.27-.256-.358-1.025-1.41-1.371-1.82-.346-.412-.718-.328-.974-.328-.242 0-.52-.01-.795-.01-.275 0-.723.102-1.102.513-.38.411-1.447 1.41-1.447 3.44 0 2.029 1.488 3.99 1.693 4.247.205.257 2.928 4.437 7.094 6.236 4.167 1.8 4.167 1.2 4.936 1.114.769-.086 2.486-1.01 2.846-1.986.36-.976.36-1.815.252-1.985-.108-.17-.395-.27-.703-.424z"/>
      </svg>
    `;

    // Chat Window
    const chatWin = document.createElement('div');
    chatWin.className = 'chat-window';
    if (position === 'left') {
      chatWin.style.left = '0';
      chatWin.style.right = 'auto';
    }

    // Avatar Initials fallback
    const initials = config.name ? config.name.substring(0, 2).toUpperCase() : 'WA';
    const avatarHTML = avatarUrl 
      ? `<img class="avatar-img" src="${avatarUrl}" alt="${config.name || 'N.C WaCRM Agent'}">`
      : initials;

    chatWin.innerHTML = `
      <div class="chat-header">
        <div class="header-info">
          <div class="avatar-wrapper">
            ${avatarHTML}
            <div class="avatar-status-dot"></div>
          </div>
          <div class="header-text">
            <span class="agent-name">${config.name || 'WhatsApp Support'}</span>
            <span class="agent-status">Online • Replies instantly</span>
          </div>
        </div>
        <button class="close-btn" type="button" aria-label="Close Chat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="chat-body">
        <div class="message-bubble">
          ${welcomeMessage}
          <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      <div class="chat-footer">
        <div class="input-wrapper">
          <textarea class="chat-input" placeholder="Type a message..." rows="1"></textarea>
          <button class="send-btn" type="button" aria-label="Send Message">
            <svg class="send-icon" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <a class="branding" href="https://nextcorebd.com/" target="_blank" rel="noopener">Powered by NextCore BD</a>
      </div>
    `;

    container.appendChild(chatWin);
    container.appendChild(bubble);
    shadow.appendChild(container);

    // Event Handlers
    const input = shadow.querySelector('.chat-input');
    const sendBtn = shadow.querySelector('.send-btn');
    const closeBtn = shadow.querySelector('.close-btn');

    // Toggle Chat Window
    function toggleChat() {
      const isOpen = chatWin.classList.toggle('open');
      if (isOpen) {
        // Remove notification dot on open
        const activeDot = shadow.querySelector('.notification-dot');
        if (activeDot) activeDot.remove();
        
        // Auto focus input
        setTimeout(() => input.focus(), 150);
      }
    }

    bubble.addEventListener('click', (e) => {
      // Prevents click bubbling if clicked on child tooltip
      if (e.target !== tooltip) {
        toggleChat();
      }
    });

    closeBtn.addEventListener('click', toggleChat);

    // Adjust textarea height dynamically
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = `${Math.min(input.scrollHeight - 16, 64)}px`;
    });

    // Send logic
    function handleSend() {
      const msg = input.value.trim();
      if (!msg) return;

      const encodedMsg = encodeURIComponent(msg);
      const url = `https://wa.me/${agentPhone}?text=${encodedMsg}`;
      window.open(url, '_blank', 'noopener');
      
      // Clear input
      input.value = '';
      input.style.height = 'auto';
      
      // Close chat window
      chatWin.classList.remove('open');
    }

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
})();
