document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Webhook URL
    const webhookUrl = 'https://pppp7445454.app.n8n.cloud/webhook/6243d789-eb2d-48cd-885c-bb50dff4bd71';
    
    // Function to add a message to the chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        // If it's a bot message with bullet points, format it properly
        if (!isUser && text.includes('•')) {
            // Clear the text content
            messageDiv.textContent = '';
            
            // Split the text into lines
            const lines = text.split('\n');
            
            // Add the first line as regular text
            const firstLine = document.createElement('div');
            firstLine.textContent = lines[0];
            messageDiv.appendChild(firstLine);
            
            // Create a list for the bullet points
            const list = document.createElement('ul');
            
            // Add each bullet point as a list item
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim().startsWith('•')) {
                    const listItem = document.createElement('li');
                    listItem.textContent = lines[i].replace('•', '').trim();
                    list.appendChild(listItem);
                }
            }
            
            messageDiv.appendChild(list);
        } else {
            messageDiv.textContent = text;
        }
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to send message to webhook
    async function sendToWebhook(message) {
        try {
            // Show typing indicator
            typingIndicator.style.display = 'block';
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            
            // Extract the actual response text from the object
            let responseText = '';
            if (data && typeof data === 'object') {
                // Handle different possible response formats
                if (data.output) {
                    responseText = data.output;
                } else if (data.response) {
                    responseText = data.response;
                } else if (data.message) {
                    responseText = data.message;
                } else {
                    // If we can't find a specific field, try to use the first string value
                    for (const key in data) {
                        if (typeof data[key] === 'string') {
                            responseText = data[key];
                            break;
                        }
                    }
                }
            } else if (typeof data === 'string') {
                responseText = data;
            }
            
            // Clean up the response if it contains the unwanted format
            if (responseText.includes("{'output': '") || responseText.includes('{"output": "')) {
                // Extract just the message content
                const match = responseText.match(/'([^']+)'|"([^"]+)"/);
                if (match) {
                    responseText = match[1] || match[2];
                }
            }
            
            // Replace escaped newlines with actual newlines
            responseText = responseText.replace(/\\n/g, '\n');
            
            addMessage(responseText, false);
        } catch (error) {
            console.error('Error:', error);
            typingIndicator.style.display = 'none';
            addMessage('Sorry, there was an error processing your request. Please try again.', false);
        }
    }
    
    // Function to handle sending a message
    function sendMessage() {
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message to chat
            addMessage(message, true);
            
            // Clear input
            chatInput.value = '';
            
            // Send to webhook
            sendToWebhook(message);
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Focus on input when page loads
    chatInput.focus();
    
    // Auto-adjust scroll position for mobile
    function adjustScroll() {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 100);
    }
    
    // Adjust scroll on window resize (keyboard appearance on mobile)
    window.addEventListener('resize', adjustScroll);
});
