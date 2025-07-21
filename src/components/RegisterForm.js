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
      onRegistered(form.phone); // Move to OTP screen
      setOtpTimer(20); // 20 seconds timer
    } catch {
      // alert('Registration failed');
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto p-4 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-100 mt-4">
      <h2 className="text-lg sm:text-2xl font-bold text-green-700 mb-4 text-center">Register</h2>
      <div className="flex flex-col gap-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-green-400 w-full"
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-green-400 w-full"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-green-400 w-full"
        />
        <button
          onClick={handleRegister}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={otpTimer > 0}
        >
          {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP'}
        </button>
      </div>
    </div>
  );
}

export default RegisterForm;
