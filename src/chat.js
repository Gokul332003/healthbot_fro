import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatContainerRef = useRef(null); // Create a ref for the chat container

  async function handleSubmit(e) {
    e.preventDefault();
    if (userInput.trim() !== '') {
      addMessage('user', userInput);

      try {
        const response = await fetch('http://localhost:5000/backend/get_response', {
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
        addMessage('bot', responseData.response, responseData.audio);
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
      // Decode the base64 audio data
      const audioBytes = atob(audioBase64);

      // Convert the decoded bytes to an ArrayBuffer
      const audioBuffer = new ArrayBuffer(audioBytes.length);
      const audioView = new Uint8Array(audioBuffer);
      for (let i = 0; i < audioBytes.length; i++) {
        audioView[i] = audioBytes.charCodeAt(i);
      }

      // Create an AudioBuffer from the ArrayBuffer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioSource = await audioContext.decodeAudioData(audioBuffer);

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

  const addMessage = (sender, text, audio) => {
    const newMessage = { sender, text, audio };
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
          ref={chatContainerRef} // Attach the ref to the chat container
          tabIndex={0} // Add tabIndex to make the div focusable
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
