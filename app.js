import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const ChatContainer = styled.div`
  width: 400px;
  height: 600px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

const Message = styled.div`
  padding: 5px;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: ${(props) => (props.isOwn ? '#e0f7fa' : '#f0f0f0')};
  align-self: ${(props) => (props.isOwn ? 'flex-end' : 'flex-start')};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [interests, setInterests] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (connected) {
      const socket = new WebSocket(`ws://api.random.lewdchat.com/ws/${interests}`);
      setWs(socket);

      socket.onopen = () => {
        console.log('Connected to WebSocket');
      };

      socket.onmessage = (event) => {
        const newMessage = event.data;
        setMessages((prevMessages) => [...prevMessages, { text: newMessage, isOwn: false }]);
      };

      socket.onclose = () => {
        console.log('WebSocket closed');
        setConnected(false);
      };

      return () => {
        socket.close();
      };
    }
  }, [connected, interests]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConnect = () => {
    setConnected(true);
  };

  const handleSendMessage = () => {
    if (ws && message) {
      ws.send(message);
      setMessages((prevMessages) => [...prevMessages, { text: message, isOwn: true }]);
      setMessage('');
    }
  };

  return (
    <Container>
      {connected ? (
        <ChatContainer>
          <MessagesContainer>
            {messages.map((msg, index) => (
              <Message key={index} isOwn={msg.isOwn}>
                {msg.text}
              </Message>
            ))}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          <InputContainer>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </InputContainer>
        </ChatContainer>
      ) : (
        <div>
          <Input
            type="text"
            placeholder="Enter interests (comma separated)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <Button onClick={handleConnect}>Connect</Button>
        </div>
      )}
    </Container>
  );
}

export default App;
