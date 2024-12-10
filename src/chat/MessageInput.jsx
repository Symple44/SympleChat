// src/components/chat/MessageInput.jsx
const MessageInput = ({ onSend, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Votre message..."
        disabled={loading}
      />
      <Button type="submit" loading={loading}>Envoyer</Button>
    </form>
  );
};