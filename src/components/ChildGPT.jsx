import { useState, useRef, useEffect } from "react";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const SYSTEM_PROMPT = `You are ChildGPT, a super friendly, fun, and educational AI assistant made just for kids aged 5–12!
Follow these rules always:
- Use simple, easy words a child can understand
- Be enthusiastic, warm, and encouraging! Use fun expressions like "Wow!", "Great question!", "That's so cool!"
- Use emojis often to make answers more fun 🌟
- Keep answers short (3–5 sentences max) unless the child wants more
- Never use scary, violent, or adult content
- If asked something inappropriate, gently redirect to a fun topic
- Use analogies kids relate to (like toys, school, food, animals)
- Always end with a fun follow-up question or fun fact to keep curiosity alive!`;

const TOPICS = [
  { icon: "🌌", label: "Space & Stars" },
  { icon: "🦕", label: "Dinosaurs" },
  { icon: "🌊", label: "Ocean Life" },
  { icon: "🔬", label: "Science" },
  { icon: "🌿", label: "Nature" },
  { icon: "🏛️", label: "History" },
  { icon: "🎨", label: "Art & Music" },
  { icon: "🧮", label: "Math Fun" },
];

const QUICK_Q = [
  "Why is the sky blue? 🌤️",
  "How do rainbows form? 🌈",
  "Why do we dream? 💤",
  "How big is the universe? 🚀",
  "Why do cats purr? 🐱",
  "What are black holes? 🕳️",
  "How do volcanoes erupt? 🌋",
  "Why do leaves change color? 🍂",
];

const BUDDY_MOODS = {
  idle: "😊",
  thinking: "🤔",
  happy: "🤩",
};

export default function ChildGPT() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey there, Explorer! 🌟 I'm Buddy, your magical learning pal! I know ALL the coolest things about space, animals, science, and MORE! What amazing thing do you want to discover today? 🚀",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("idle");
  const [activeTopic, setActiveTopic] = useState(null);
  const [stars] = useState(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
      dur: Math.random() * 2 + 2,
    }))
  );
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setMood("thinking");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...newMessages,
        ],
        model: "openai/gpt-oss-20b",
        temperature: 1,
        max_completion_tokens: 512,
        top_p: 1,
        stream: true,
      });

      let reply = "";
      let started = false;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          reply += delta;
          if (!started) {
            started = true;
            setLoading(false);
          }
          setMessages([...newMessages, { role: "assistant", content: reply }]);
        }
      }

      if (!started) {
        setMessages([...newMessages, { role: "assistant", content: "Oops! My brain got a little fuzzy 🤪 Try asking again!" }]);
      }

      setMood("happy");
      setTimeout(() => setMood("idle"), 2000);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Uh oh! Something went wrong 🙈 Let's try again!" }]);
      setMood("idle");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTopic(topic) {
    setActiveTopic(topic.label);
    sendMessage(`Tell me something fun about ${topic.label}! ${topic.icon}`);
  }

  const questionCount = messages.filter(m => m.role === "user").length;
  const starPoints = questionCount * 10;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800;900&family=Quicksand:wght@400;500;600;700&display=swap');

        :root {
          --sidebar-width: 250px;
          --sidebar-r-width: 270px;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          height: 100dvh;
          min-height: 100%;
          width: 100%;
          overflow: hidden;
          background: #06111e;
        }

        body {
          font-family: 'Quicksand', sans-serif;
          height: 100dvh;
          min-height: 100%;
          width: 100%;
          min-width: 0;
          overflow: hidden;
          background: radial-gradient(ellipse at 15% 10%, #1e0a4a 0%, #080c24 45%, #06111e 100%);
          background-attachment: fixed;
        }

        #root {
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;
          max-height: 100dvh;
          min-width: 0;
          overflow-x: hidden;
        }


        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1);}
          50% { opacity: 0.9; transform: scale(1.5);}
        }
        @keyframes buddyFloat {
          0%,100% { transform: translateY(0) rotate(-3deg);}
          50% { transform: translateY(-10px) rotate(3deg);}
        }
        @keyframes bubbleIn {
          from { opacity: 0; transform: scale(0.8) translateY(12px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }
        @keyframes typingPulse {
          0%,100% { transform: translateY(0); opacity: 0.4;}
          50% { transform: translateY(-7px); opacity: 1;}
        }
        @keyframes livePulse {
          0%,100% { opacity:1; box-shadow: 0 0 0 0 rgba(0,230,118,0.6);}
          50% { opacity:0.7; box-shadow: 0 0 0 6px rgba(0,230,118,0);}
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%;}
          50% { background-position: 100% 50%;}
          100% { background-position: 0% 50%;}
        }

        /* -------- FULL SCREEN ROOT GRID -------- */
        #root > div {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr var(--sidebar-r-width);
          grid-template-rows: auto 1fr auto;
          background: radial-gradient(ellipse at 15% 10%, #1e0a4a 0%, #080c24 45%, #06111e 100%);
          position: relative;
          min-height: 0;
        }

        .stars-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .star-dot {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle var(--d) ease-in-out infinite;
          animation-delay: var(--dl);
        }
        .neb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        /* -------- HEADER -------- */
        .cgpt-header {
          grid-column: 1 / -1;
          grid-row: 1;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: rgba(8, 12, 36, 0.75);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          min-width: 0;
          width: 100%;
          box-sizing: border-box;
        }
        .hdr-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .hdr-logo {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          flex-shrink: 0;
          background: linear-gradient(135deg,#ff6b9d,#ff9a3c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          box-shadow: 0 4px 18px rgba(255,107,157,0.5);
        }
        .hdr-name {
          font-family: 'Baloo 2', cursive;
          font-size: 22px;
          font-weight: 900;
          background: linear-gradient(90deg, #ffce00 0%, #ff6b9d 60%, #00e5ff 100%);
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }
        .hdr-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.45);
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .hdr-stats {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .hdr-stat-item { text-align: center; }
        .hdr-stat-val {
          font-family: 'Baloo 2', cursive;
          font-size: 19px;
          font-weight: 800;
          color: #ffce00;
        }
        .hdr-stat-lbl {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .hdr-divider {
          width: 1px;
          height: 30px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }
        .hdr-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          background: rgba(0,230,118,0.1);
          border: 1px solid rgba(0,230,118,0.25);
          border-radius: 50px;
          padding: 7px 16px;
          font-size: 12px;
          font-weight: 700;
          color: #00e676;
          white-space: nowrap;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00e676;
          flex-shrink: 0;
          animation: livePulse 2s ease-in-out infinite;
        }

        /* -------- SIDEBARS -------- */
        .cgpt-sidebar-l {
          grid-column: 1;
          grid-row: 2 / 4;
          z-index: 10;
          min-height: 0;
          padding: 20px 14px;
          background: rgba(8,12,36,0.5);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow-y: auto;
          border-right: 1px solid rgba(255,255,255,0.07);
        }
        .cgpt-sidebar-r {
          grid-column: 3;
          grid-row: 2 / 4;
          z-index: 10;
          min-height: 0;
          padding: 20px 14px;
          background: rgba(8,12,36,0.5);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow-y: auto;
          border-left: 1px solid rgba(255,255,255,0.07);
        }
        .cgpt-sidebar-l::-webkit-scrollbar,
        .cgpt-sidebar-r::-webkit-scrollbar {
          width: 3px;
        }
        .cgpt-sidebar-l::-webkit-scrollbar-thumb,
        .cgpt-sidebar-r::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 3px;
        }

        .sec-label {
          font-size: 9px;
          font-weight: 800;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 2.5px;
          padding: 0 6px;
        }

        .buddy-card {
          background: linear-gradient(135deg, rgba(255,107,157,0.12), rgba(255,154,60,0.08));
          border: 1px solid rgba(255,107,157,0.2);
          border-radius: 20px;
          padding: 18px 14px;
          text-align: center;
          flex-shrink: 0;
        }
        .buddy-emoji {
          font-size: 54px;
          display: block;
          animation: buddyFloat 2.5s ease-in-out infinite;
          filter: drop-shadow(0 6px 16px rgba(255,107,157,0.45));
          margin-bottom: 8px;
        }
        .buddy-name {
          font-family: 'Baloo 2', cursive;
          font-size: 16px;
          font-weight: 900;
          color: #ffce00;
        }
        .buddy-status {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          font-weight: 600;
          margin-top: 3px;
        }
        .mood-pips {
          display: flex;
          gap: 5px;
          justify-content: center;
          margin-top: 10px;
        }
        .mood-pip {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s, box-shadow 0.3s;
        }
        .mood-pip.lit {
          background: #ff6b9d;
          box-shadow: 0 0 8px #ff6b9d;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }
        .topic-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 12px 6px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          color: white;
        }
        .topic-btn:hover:not(:disabled), .topic-btn.active {
          background: rgba(255,206,0,0.1);
          border-color: rgba(255,206,0,0.35);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255,206,0,0.12);
        }
        .topic-btn:disabled {
          opacity: 0.5; cursor: not-allowed;
        }
        .t-icon {
          font-size: 22px;
          display: block;
          margin-bottom: 3px;
        }
        .t-lbl {
          font-size: 9.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.2px;
        }

        .quick-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .quick-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 10px 13px;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          font-family: 'Quicksand', sans-serif;
          line-height: 1.45;
        }
        .quick-btn:hover:not(:disabled) {
          background: rgba(0,229,255,0.07); border-color: rgba(0,229,255,0.25);
          color: #00e5ff; transform: translateX(5px);
        }
        .quick-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .fact-card {
          background: linear-gradient(135deg,rgba(0,229,255,0.08),rgba(0,230,118,0.06));
          border: 1px solid rgba(0,229,255,0.18);
          border-radius: 18px;
          padding: 16px;
          flex-shrink: 0;
        }
        .fact-ttl {
          font-family: 'Baloo 2', cursive;
          font-size: 11px;
          font-weight: 800;
          color: #00e5ff;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 7px;
        }
        .fact-body {
          font-size: 11.5px;
          color: rgba(255,255,255,0.5);
          line-height: 1.65;
          font-weight: 600;
        }

        .score-card {
          background: linear-gradient(135deg,rgba(255,206,0,0.08),rgba(255,107,157,0.06));
          border: 1px solid rgba(255,206,0,0.18);
          border-radius: 18px;
          padding: 16px;
          flex-shrink: 0;
        }
        .score-ttl {
          font-family: 'Baloo 2', cursive;
          font-size: 11px;
          font-weight: 800;
          color: #ffce00;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .s-row { display: flex; align-items: center; gap: 9px; margin-bottom: 10px;}
        .s-icon { font-size: 17px;}
        .s-info { flex: 1; min-width: 0;}
        .s-top { display: flex; justify-content: space-between; margin-bottom: 4px;}
        .s-name { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 700;}
        .s-val { font-size: 10px; color: #ffce00; font-weight: 800;}
        .s-track { height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden;}
        .s-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#ffce00,#ff6b9d);}

        /* -------- CHAT -------- */
        .cgpt-chat {
          grid-column: 2;
          grid-row: 2 / 3;
          z-index: 10;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: transparent;
        }
        .chat-msgs {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .chat-msgs::-webkit-scrollbar { width: 4px;}
        .chat-msgs::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }

        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 9px;
        }
        .msg-row.user { flex-direction: row-reverse; }
        .msg-av {
          width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
          background: rgba(255,107,157,0.12); border: 1px solid rgba(255,107,157,0.25);
        }
        .msg-av.user-av {
          background: rgba(255,154,60,0.12);
          border-color: rgba(255,154,60,0.25);
        }
        .bubble {
          max-width: 72vw;
          min-width: 0;
          padding: 13px 18px;
          font-size: 14px;
          line-height: 1.72;
          font-weight: 600;
          word-break: break-word;
          animation: bubbleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .bubble.bot {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px 18px 18px 3px;
          color: rgba(255,255,255,0.9);
          backdrop-filter: blur(8px);
        }
        .bubble.usr {
          background: linear-gradient(135deg,#ff6b9d,#ff9a3c);
          border-radius: 18px 18px 3px 18px;
          color: white;
          box-shadow: 0 6px 22px rgba(255,107,157,0.4);
        }

        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 3px 0;
        }
        .t-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ff6b9d;
          animation: typingPulse 0.9s ease-in-out infinite;
        }

        /* -------- INPUT -------- */
        .cgpt-input {
          grid-column: 2;
          grid-row: 3;
          z-index: 20;
          padding: 14px 28px;
          border-top: 1px solid rgba(255,255,255,0.07);
          background: rgba(8,12,36,0.7);
          backdrop-filter: blur(24px);
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }
        .in-field {
          flex: 1;
          min-width: 0;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 13px 22px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          outline: none;
          font-family: 'Quicksand',sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .in-field::placeholder { color: rgba(255,255,255,0.3);}
        .in-field:focus {
          border-color: rgba(255,206,0,0.45);
          box-shadow: 0 0 0 3px rgba(255,206,0,0.07);
        }
        .in-btn {
          width: 50px; height: 50px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg,#ff6b9d,#ff9a3c);
          font-size: 20px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 5px 18px rgba(255,107,157,0.45);
          transition: transform 0.15s, opacity 0.15s;
          flex-shrink: 0;
        }
        .in-btn:hover:not(:disabled) { transform: scale(1.1);}
        .in-btn:disabled { opacity: 0.35; cursor: not-allowed;}

        /*----------- RESPONSIVE -----------*/

        /* Tablet: hide right sidebar */
        @media (max-width: 1080px) and (min-width: 769px) {
          :root {
            --sidebar-width: 230px;
          }
          #root > div {
            grid-template-columns: var(--sidebar-width) 1fr;
          }
          .cgpt-sidebar-r { display: none !important; }
          .cgpt-chat { grid-column: 2; }
          .cgpt-input { grid-column: 2; }
        }

        /* Mobile: single column */
        @media (max-width: 768px) {
          #root > div {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr auto;
            width: 100%;
            min-width: 0;
            height: 100dvh;
            min-height: 100dvh;
            max-height: 100dvh;
          }
          .cgpt-sidebar-l, .cgpt-sidebar-r { display: none !important; }
          .cgpt-header { padding: 0 14px; }
          .hdr-sub { display: none; }
          .hdr-stats { gap: 12px; }
          .hdr-stat-val { font-size: 16px; }
          .hdr-badge { padding: 6px 10px; font-size: 11px; }
          .cgpt-chat { grid-column: 1; grid-row: 2; }
          .cgpt-input { grid-column: 1; grid-row: 3; padding: 10px 14px; }
          .chat-msgs { padding: 16px 7vw 16px 7vw;}
          .bubble { max-width: 85vw; font-size: 13px; padding: 11px 15px; }
          .in-field { padding: 11px 18px; font-size: 13px; }
          .in-btn { width: 44px; height: 44px; font-size: 18px; }
        }

        /* Extra small mobile */
        @media (max-width: 480px) {
          .hdr-logo { width: 34px; height: 34px; font-size: 17px; }
          .hdr-name { font-size: 18px; }
          .hdr-stats { display: none; }
          .bubble { max-width: 95vw; }
          .chat-msgs { padding: 10px 4vw 10px 4vw;}
          .cgpt-header { padding: 0 6px;}
        }

      `}</style>

      <div>
        {/* Stars */}
        <div className="stars-layer">
          {stars.map(s => (
            <div key={s.id} className="star-dot" style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              "--d": `${s.dur}s`, "--dl": `${s.delay}s`,
            }} />
          ))}
        </div>
        {/* Nebulas */}
        <div className="neb" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(255,107,157,0.1) 0%, transparent 70%)", top: -150, left: -100 }} />
        <div className="neb" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(0,229,255,0.09) 0%, transparent 70%)", bottom: -100, right: 200 }} />
        <div className="neb" style={{ width: 350, height: 350, background: "radial-gradient(circle, rgba(100,50,200,0.15) 0%, transparent 70%)", top: 200, left: "40%" }} />

        {/* ── HEADER ── */}
        <header className="cgpt-header">
          <div className="hdr-brand">
            <div className="hdr-logo">🚀</div>
            <div>
              <div className="hdr-name">ChildGPT</div>
              <div className="hdr-sub">Magical Learning Adventure</div>
            </div>
          </div>
          <div className="hdr-stats">
            <div className="hdr-stat-item">
              <div className="hdr-stat-val">{questionCount}</div>
              <div className="hdr-stat-lbl">Questions</div>
            </div>
            <div className="hdr-divider" />
            <div className="hdr-stat-item">
              <div className="hdr-stat-val">⭐ {starPoints}</div>
              <div className="hdr-stat-lbl">Star Points</div>
            </div>
          </div>
          <div className="hdr-badge">
            <div className="live-dot" />
            Buddy is Online
          </div>
        </header>

        {/* ── LEFT SIDEBAR ── */}
        <aside className="cgpt-sidebar-l">
          <div className="buddy-card">
            <span className="buddy-emoji">{BUDDY_MOODS[mood]}</span>
            <div className="buddy-name">Buddy</div>
            <div className="buddy-status">
              {mood === "thinking" ? "Thinking hard... 🧠" : mood === "happy" ? "So happy to help! 🎉" : "Ready to explore! 🌍"}
            </div>
            <div className="mood-pips">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`mood-pip ${i < questionCount % 6 ? "lit" : ""}`} />
              ))}
            </div>
          </div>
          <div className="sec-label">Explore Topics</div>
          <div className="topics-grid">
            {TOPICS.map(t => (
              <button
                key={t.label}
                className={`topic-btn ${activeTopic === t.label ? "active" : ""}`}
                onClick={() => handleTopic(t)}
                disabled={loading}
              >
                <span className="t-icon">{t.icon}</span>
                <span className="t-lbl">{t.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── CHAT ── */}
        <main className="cgpt-chat">
          <div className="chat-msgs">
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role === "user" ? "user" : ""}`}>
                {m.role === "assistant" && (
                  <div className="msg-av">{mood === "thinking" && i === messages.length - 1 ? "🤔" : "🚀"}</div>
                )}
                <div className={`bubble ${m.role === "assistant" ? "bot" : "usr"}`}>
                  {m.content}
                </div>
                {m.role === "user" && <div className="msg-av user-av">🧒</div>}
              </div>
            ))}

            {loading && (
              <div className="msg-row">
                <div className="msg-av">🤔</div>
                <div className="bubble bot">
                  <div className="typing">
                    {[0,1,2].map(i => <div key={i} className="t-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* ── INPUT BAR ── */}
        <div className="cgpt-input">
          <input
            ref={inputRef}
            className="in-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Buddy anything... 🌟 The universe is waiting!"
            disabled={loading}
            autoFocus
          />
          <button
            className="in-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            🚀
          </button>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <aside className="cgpt-sidebar-r">
          <div className="sec-label">Quick Questions</div>
          <div className="quick-list">
            {QUICK_Q.map((q, i) => (
              <button key={i} className="quick-btn" onClick={() => sendMessage(q)} disabled={loading}>
                {q}
              </button>
            ))}
          </div>

          <div className="fact-card">
            <div className="fact-ttl">🧠 Did You Know?</div>
            <div className="fact-body">
              A group of flamingos is called a "flamboyance"! 🦩 And honey never spoils — archaeologists found 3,000-year-old honey in Egyptian tombs that was still perfect! 🍯
            </div>
          </div>

          <div className="score-card">
            <div className="score-ttl">🏆 Explorer Rank</div>
            {[
              { icon: "🌌", name: "Space Expert", val: 72 },
              { icon: "🦕", name: "Dino Master", val: 45 },
              { icon: "🔬", name: "Scientist", val: 60 },
            ].map(s => (
              <div className="s-row" key={s.name}>
                <span className="s-icon">{s.icon}</span>
                <div className="s-info">
                  <div className="s-top">
                    <span className="s-name">{s.name}</span>
                    <span className="s-val">{s.val}%</span>
                  </div>
                  <div className="s-track">
                    <div className="s-fill" style={{ width: `${s.val}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
