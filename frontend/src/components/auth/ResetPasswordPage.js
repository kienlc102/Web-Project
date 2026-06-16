import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../shared/PageShell';
import { resetPassword } from '../../utils/appApi';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await resetPassword(form);
      alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Đặt lại mật khẩu" subtitle="Nhập mã xác nhận từ email và mật khẩu mới">
      <form className="ops-card ops-stack" onSubmit={handleSubmit} style={{ maxWidth: 460 }}>
        {error ? <div className="ops-error">{error}</div> : null}
        <label className="ops-label">
          Email
          <input className="ops-input" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
        </label>
        <label className="ops-label">
          Mã xác nhận (6 số)
          <input className="ops-input" type="text" value={form.token} onChange={(event) => updateField('token', event.target.value)} maxLength="6" pattern="[0-9]{6}" required />
        </label>
        <label className="ops-label">
          Mật khẩu mới
          <input className="ops-input" type="password" value={form.newPassword} onChange={(event) => updateField('newPassword', event.target.value)} required minLength="8" />
        </label>
        <label className="ops-label">
          Xác nhận mật khẩu mới
          <input className="ops-input" type="password" value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} required minLength="8" />
        </label>
        <div className="ops-actions">
          <button className="ops-button" disabled={busy}>{busy ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          <Link to="/forgot-password" style={{ color: '#666', marginRight: '16px' }}>Gửi lại mã</Link>
          <Link to="/login" style={{ color: '#666' }}>← Quay lại đăng nhập</Link>
        </div>
      </form>
    </PageShell>
  );
};

export default ResetPasswordPage;
