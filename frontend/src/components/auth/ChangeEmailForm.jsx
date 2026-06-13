import React, { useState } from 'react';
import { Button, Input, Toast } from '../shared/designSystem';
import { changeEmail } from '../../utils/appApi';
import { useAuth } from './AuthProvider';

const initialForm = {
  newEmail: '',
  password: '',
};

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email là bắt buộc';
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length < 5) {
    return 'Email phải có ít nhất 5 ký tự';
  }

  if (trimmed.length > 255) {
    return 'Email không được vượt quá 255 ký tự';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Email không đúng định dạng';
  }

  return '';
}

function validateForm(form, currentEmail) {
  if (!form.newEmail || !form.password) {
    return 'Vui lòng nhập đầy đủ thông tin';
  }

  const emailError = validateEmail(form.newEmail);
  if (emailError) {
    return emailError;
  }

  if (form.newEmail.toLowerCase().trim() === currentEmail?.toLowerCase()) {
    return 'Email mới phải khác email hiện tại';
  }

  return '';
}

export default function ChangeEmailForm() {
  const auth = useAuth();
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm(form, auth.user?.email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const result = await changeEmail(form);
      setForm(initialForm);
      setMessage(result?.message || 'Đổi email thành công. Đang cập nhật...');

      // Refresh user profile to get new email
      setTimeout(() => {
        auth.refreshUser();
      }, 500);
    } catch (submitError) {
      setError(submitError.message || 'Không thể đổi email');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ops-stack" onSubmit={handleSubmit}>
      {message ? <Toast>{message}</Toast> : null}
      {error ? <Toast variant="danger">{error}</Toast> : null}

      <Input
        label="Email mới"
        type="email"
        value={form.newEmail}
        onChange={(event) => updateField('newEmail', event.target.value)}
        autoComplete="email"
        placeholder="example@domain.com"
        disabled={busy}
        required
      />

      <Input
        label="Mật khẩu xác nhận"
        type="password"
        value={form.password}
        onChange={(event) => updateField('password', event.target.value)}
        autoComplete="current-password"
        disabled={busy}
        required
      />

      <div className="ops-actions">
        <Button type="submit" disabled={busy}>
          {busy ? 'Đang đổi email...' : 'Đổi email'}
        </Button>
      </div>
    </form>
  );
}
