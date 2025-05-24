const ChatMessage = ({ sender, text, time }) => {
  const isClient = sender.includes('client');

  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-xl ${isClient ? 'bg-green-100 text-right' : 'bg-white text-left'} shadow-sm`}>
        <p className="text-sm text-green-800">{text}</p>
        <p className="text-[10px] text-gray-500 mt-1">
          {isClient ? `Sent: ${time}` : `Agent. ${time}`}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;