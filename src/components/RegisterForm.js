
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function RegisterForm({ onRegistered }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (otpTimer > 0) return;
    try {
      await axios.post('http://localhost:9090/api/users/register', form);
      // alert('OTP sent to your phone');
      onRegistered(form.phone); // Move to OTP screen
      setOtpTimer(20); // 20 seconds timer
    } catch {
      // alert('Registration failed');
    }
  };

  return (
    <div className="p-4">
      <h2>Register</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 block" />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-2 block" />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 block" />
      <button
        onClick={handleRegister}
        className="bg-green-500 text-white px-4 py-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={otpTimer > 0}
      >
        {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP'}
      </button>
    </div>
  );
}

export default RegisterForm;
