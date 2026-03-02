import React from 'react';
//import { styles } from '../styles';

export default function FailPage() {
    const searchParams = new URLSearchParams(window.location.search);
    return (
        <div style={{ padding: '20px' }}>
            <h1>결제 실패</h1>
            <p>{searchParams.get("message")}</p>
            <button onClick={() => window.location.href = '/charge'}>홈으로</button>
        </div>
    );
}
