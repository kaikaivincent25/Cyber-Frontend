import { useEffect, useRef, useState } from "react";
import "./ChatPanel.css";

const POLL_INTERVAL_MS = 4000;

export default function ChatPanel({ fetchMessages, sendMessage, isMine }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchMessages()
        .then((data) => {
          if (!cancelled) setMessages(data);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message || "Failed to load messages.");
        });
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    
    setSending(true);
    setError("");
    
    try {
      const sent = await sendMessage(draft.trim());
      setMessages((prev) => [...prev, sent]);
      setDraft("");
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <p className="chat-empty-text">No messages yet. Send one to start the conversation.</p>
          </div>
        )}
        
        {messages.map((m) => {
          const mine = isMine(m);
          return (
            <div 
              key={m.id} 
              className={`chat-bubble-wrapper ${mine ? "wrapper-mine" : "wrapper-theirs"}`}
            >
              <div className={`chat-bubble ${mine ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                <p className="chat-bubble-body">{m.body}</p>
              </div>
              <span className="chat-bubble-time">
                {new Date(m.created_at).toLocaleTimeString("en-KE", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="chat-error-toast" role="alert">
          {error}
        </div>
      )}

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={sending}
        />
        <button 
          className="btn-chat-send" 
          type="submit" 
          disabled={sending || !draft.trim()}
          aria-label="Send message"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}