import { useState } from "react";

function Tooltip({ text, title, children }: { text: string[], title?: string, children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);

    return (
        <span
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
            {children}
            {visible && (
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '100%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#333',
                    color: '#fff',
                    padding: '5px',
                    borderRadius: '3px',
                    whiteSpace: 'pre-wrap',
                    zIndex: 1
                }}>
                    {title && <strong>{title + '\n'}</strong>}
                    {text.join('\n')}
                </div>
            )}
        </span>
    );
}

export default Tooltip