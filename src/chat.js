import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (userInput.trim() !== '') {
      addMessage('user', userInput);

      try {
        const response = await fetch('https://bot-lg9n.onrender.com/get_response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userInput }),
        });
        const responseData = await response.json();
        const audioBase64 = responseData.audio;
        if (audioBase64) {
          playAudio(audioBase64);
        }
        addMessage('bot', responseData.response);
      } catch (error) {
        console.error('Error fetching response:', error);
      }
      setUserInput('');
    }
  }

  useEffect(() => {
    // Focus on the chat container when messages change
    chatContainerRef.current.focus();
  }, [messages]);

  // ... playAudio and addMessage functions ...

  const playAudio = async (audioBase64) => {
    try {
      // Convert the base64 audio to an ArrayBuffer
      const arrayBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0)).buffer;

      // Create an AudioBuffer from the ArrayBuffer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioSource = await audioContext.decodeAudioData(arrayBuffer);

      // Create an AudioBufferSourceNode and play the audio
      const audioNode = audioContext.createBufferSource();
      audioNode.buffer = audioSource;
      audioNode.connect(audioContext.destination);
      audioNode.start();

      // Clean up the AudioContext after playback
      setTimeout(() => {
        audioContext.close();
      }, audioSource.duration * 1000);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const addMessage = (sender, text) => {
    const newMessage = { sender, text };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return (
    <div className="chatgpt-container">
      <div className="chatgpt-header">
        <h1>HealthBot</h1>
      </div>
      <div className="chatgpt-content">
        {/* Chat interface */}
        <div
          className="chat-container"
          ref={chatContainerRef}
          tabIndex={0}
        >
          <div className="message-box">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.sender === 'user' ? 'You' : 'HealthBot'}: {message.text}
              </div>
            ))}
          </div>
        </div>
        {/* Input form */}
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;