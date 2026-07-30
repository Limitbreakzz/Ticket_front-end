// Emoji to FontAwesome / CSS Icon Parser Helper
export const renderTextWithIcons = (text) => {
  if (!text) return text;
  
  const emojiMap = {
    '🔄': <i className="fa-solid fa-arrows-rotate" style={{ color: 'var(--primary)', marginRight: '4px' }}></i>,
    '🆕': <span style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, marginRight: '4px', verticalAlign: 'middle' }}>NEW</span>,
    '🟢': <i className="fa-solid fa-circle" style={{ color: 'var(--success)', fontSize: '8px', marginRight: '6px', verticalAlign: 'middle' }}></i>,
    '🟡': <i className="fa-solid fa-circle" style={{ color: '#d97706', fontSize: '8px', marginRight: '6px', verticalAlign: 'middle' }}></i>,
    '🔴': <i className="fa-solid fa-circle" style={{ color: 'var(--danger)', fontSize: '8px', marginRight: '6px', verticalAlign: 'middle' }}></i>,
    '⚫': <i className="fa-solid fa-circle" style={{ color: 'var(--text-muted)', fontSize: '8px', marginRight: '6px', verticalAlign: 'middle' }}></i>,
    '🔵': <i className="fa-solid fa-circle" style={{ color: 'var(--primary)', fontSize: '8px', marginRight: '6px', verticalAlign: 'middle' }}></i>,
    '🚫': <i className="fa-solid fa-ban" style={{ color: 'var(--danger)', marginRight: '4px' }}></i>,
    '❌': <i className="fa-solid fa-circle-xmark" style={{ color: 'var(--danger)', marginRight: '4px' }}></i>,
    '⏳': <i className="fa-solid fa-hourglass-half" style={{ color: '#d97706', marginRight: '4px' }}></i>,
    '🔧': <i className="fa-solid fa-wrench" style={{ color: '#d97706', marginRight: '4px' }}></i>,
    '🏢': <i className="fa-solid fa-building" style={{ color: 'var(--primary)', marginRight: '4px' }}></i>,
    '➡️': <i className="fa-solid fa-arrow-right" style={{ color: 'var(--text-muted)', marginRight: '4px' }}></i>,
    '⚙️': <i className="fa-solid fa-gear" style={{ color: 'var(--text-muted)', marginRight: '4px' }}></i>,
    '📋': <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)', marginRight: '4px' }}></i>,
    '👤': <i className="fa-solid fa-user" style={{ color: 'var(--text-secondary)', marginRight: '4px' }}></i>,
    '🔗': <i className="fa-solid fa-link" style={{ color: 'var(--primary)', marginRight: '4px' }}></i>,
    '✅': <i className="fa-solid fa-circle-check" style={{ color: 'var(--success)', marginRight: '4px' }}></i>,
    '💬': <i className="fa-solid fa-comment-dots" style={{ color: 'var(--primary)', marginRight: '4px' }}></i>,
  };

  const keys = Object.keys(emojiMap);
  let parts = [text];

  keys.forEach(emoji => {
    let nextParts = [];
    parts.forEach(part => {
      if (typeof part === 'string' && part.includes(emoji)) {
        const splitText = part.split(emoji);
        for (let i = 0; i < splitText.length; i++) {
          nextParts.push(splitText[i]);
          if (i < splitText.length - 1) {
            nextParts.push(emojiMap[emoji]);
          }
        }
      } else {
        nextParts.push(part);
      }
    });
    parts = nextParts;
  });

  return (
    <>
      {parts.map((part, idx) => (
        <span key={idx}>{part}</span>
      ))}
    </>
  );
};
