import { useState } from 'react';
import ChatMessage from './ChatMessage';
import { FiSend, FiMessageCircle, FiMinus } from 'react-icons/fi';
import { DUMMY_MESSAGES } from '../constants';


const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const toggleOpen = () => setIsOpen(prev => !prev);

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {isOpen ? (
        <div className="w-80 h-96 bg-white border border-green-600 rounded-lg shadow-lg flex flex-col">
          <div className="bg-green-600 text-white px-4 py-2 flex justify-between items-center rounded-t-lg">
            <span className="font-semibold">Agent TraceRxTech</span>
            <button onClick={toggleOpen}><FiMinus /></button>
          </div>

          <div className="flex-1 p-3 overflow-y-scroll space-y-2 bg-gray-50">
            {DUMMY_MESSAGES.map((msg, idx) => (
              <ChatMessage key={idx} sender={msg.sender} text={msg.text} time={msg.time} />
            ))}
          </div>

          <div className="border-t border-gray-300 p-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-green-600 rounded-full px-4 py-1 focus:outline-none"
              />
              <button className="text-green-600 hover:text-green-800">
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-green-600 text-green-700 rounded-full shadow-md hover:bg-green-600 hover:text-white transition"
        >
          <FiMessageCircle size={20} /> Ask TraceRxTech
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
