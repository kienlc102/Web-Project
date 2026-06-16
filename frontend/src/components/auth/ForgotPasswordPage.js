import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../shared/PageShell';
import { forgotPassword } from '../../utils/appApi';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess(false);
    
    try {
      const result = await forgotPassword(email);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận mã xác nhận"
    >
      <form className="ops-card ops-stack" onSubmit={handleSubmit} style={{ maxWidth: 460 }}>
        {error ? <div className="ops-error">{error}</div> : null}
        {success ? (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <strong>✅ Đã gửi mã xác nhận!</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              Vui lòng kiểm tra email của bạn. Mã có hiệu lực trong 15 phút.
            </p>
            <Link 
              to="/reset-password" 
              style={{ 
                color: '#155724', 
                fontWeight: 'bold',
                textDecoration: 'underline',
                display: 'inline-block',
                marginTop: '8px'
              }}
            >
              Nhập mã xác nhận →
            </Link>
          </div>
        ) : null}
        
        <label className="ops-label">
          Email đã đăng ký
          <input 
            className="ops-input" 
            type="email"
            value={email} 
            onChange={(event) => setEmail(event.target.value)} 
            placeholder="example@email.com"
            required 
            disabled={busy || success}
          />
        </label>
        
        <div className="ops-actions">
          <button className="ops-button" disabled={busy || success}>
            {busy ? 'Đang gửi...' : 'Gửi mã xác nhận'}
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          <Link to="/login" style={{ color: '#666' }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </PageShell>
  );
};

export default ForgotPasswordPage;
