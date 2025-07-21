import React, { useState, useEffect, useRef } from 'react';

function LoginForm({ onLoginSuccess }) {
  const [step, setStep] = useState('enterPhone');
  const [phone, setPhone] = useState('+91');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [password, setPassword] = useState('');
  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (step === 'enterPhone' && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
    if (step === 'register' && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
    if (isOtpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step, isOtpSent]);

  // Check if phone exists in DB
  const checkPhoneExists = async (phone) => {
    const res = await fetch('http://localhost:9090/api/users/check-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return await res.json();
  };

  // Send OTP
  const sendOtp = async (phone) => {
    const res = await fetch('http://localhost:9090/api/users/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const text = await res.text();
    if (res.ok) {
      setIsOtpSent(true);
      setError('');
    } else {
      setError(text);
    }
  };

  // Verify OTP
  const verifyOtp = async (phone, otp) => {
    const res = await fetch('http://localhost:9090/api/users/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const ok = await res.json();
    if (ok) {
      try {
        const userRes = await fetch(`http://localhost:9090/api/users/by-phone/${encodeURIComponent(phone)}`);
        const userInfo = await userRes.json();
        onLoginSuccess(userInfo);
      } catch (e) {
        onLoginSuccess({ firstName: '', address: '', phone });
      }
    } else {
      setError('Invalid OTP');
    }
  };

  const nameRegex = /^[a-zA-Z\s]+$/;

  // Register user
  const registerUser = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else if (!nameRegex.test(name)) {
      setNameError('Name should not contain special characters or numbers');
      valid = false;
    } else {
      setNameError('');
    }

    const digitsOnly = phone.replace(/\D/g, '');
    // Only check for 10 digits after +91
    if (!phone.startsWith('+91') || digitsOnly.length !== 12) {
      setPhoneError('Please enter 10-digits contact number');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!valid) return;

    // ...existing registration logic...
    if (!name || !phone) {
      setError('All fields are required');
      return;
    }
    const res = await fetch('http://localhost:9090/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone }),
    });
    const result = await res.text();
    if (res.ok) {
      setError('');
      setIsOtpSent(true);
    } else {
      setError(result);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    const digitsOnly = phone.replace(/\D/g, '');
    // Only check for 10 digits after +91
    if (!phone.startsWith('+91') || digitsOnly.length !== 12) {
      setPhoneError('Please enter 10-digits contact number');
      return;
    }
    setPhoneError('');
    // Check if phone exists in DB
    checkPhoneExists(phone).then(exists => {
      if (typeof exists === 'object' && exists !== null) {
        exists = exists.exists || exists.found || exists.phoneExists || false;
      }
      if (exists === true) {
        // Send OTP
        sendOtp(phone);
      } else {
        setError('Contact number not found. Please register.');
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // REMOVE touched state logic
    // setTouched(true);
    // if (!isValidPhone(phone)) return;
    // ...login logic...
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Always keep +91 at the start
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+?91?/, '');
    }
    // Remove all non-numeric characters except + at the start
    value = '+91' + value.slice(3).replace(/[^0-9]/g, '');
    setPhone(value);
    setPhoneError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-sm mx-2 p-4 sm:p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-extrabold">ATO</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-700 mt-3 text-center">
            {step === 'register' ? 'Please Register' : 'Please Login'}
          </span>
        </div>
        {error && <div className="text-red-500 mb-4 text-center font-medium text-sm">{error}</div>}

        {step === 'enterPhone' && (
          <>
            <label className="block mb-2 font-medium text-gray-700 text-sm">Contact Number</label>
            <div className="flex gap-2 mb-4">
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={13}
                value={phone}
                onChange={handlePhoneChange}
                className="border border-gray-300 px-3 py-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition text-base"
                onClick={handleSendOtp}
                style={{ minWidth: '90px' }}
              >
                Send OTP
              </button>
            </div>
            {phoneError && (
              <div className="text-red-600 text-sm mb-2">{phoneError}</div>
            )}
            {isOtpSent && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Enter (4-digits) OTP sent to {phone}:
                </label>
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="border border-gray-300 px-3 py-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base"
                  placeholder="Enter OTP"
                />
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full font-semibold shadow transition text-base"
                  onClick={() => {
                    if (otp.length < 4) {
                      setError('OTP should be 4 digits');
                      return;
                    }
                    verifyOtp(phone, otp);
                  }}
                  disabled={otp.length < 4}
                >
                  Verify
                </button>
              </div>
            )}
            <div className="text-center mt-4">
              <span className="text-gray-600 text-sm">New customer? </span>
              <button
                className="text-purple-700 hover:underline font-semibold text-sm"
                onClick={() => { setStep('register'); setError(''); setIsOtpSent(false); }}
              >
                Register
              </button>
            </div>
          </>
        )}

        {step === 'register' && (
          <>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setNameError('');
              }}
              className="border border-gray-300 px-3 py-2 mb-1 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
              placeholder="Name"
            />
            {nameError && (
              <div className="text-red-600 text-sm mb-2">{nameError}</div>
            )}

            <label className="block mb-1 font-medium text-gray-700 text-sm">Contact Number</label>
            <div className="flex gap-2 mb-4">
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={13}
                value={phone}
                onChange={handlePhoneChange}
                className="border border-gray-300 px-3 py-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition text-base"
                onClick={registerUser}
                style={{ minWidth: '90px' }}
                disabled={phone.replace(/^\+91/, '').length !== 10}
              >
                Send OTP
              </button>
            </div>
            {phoneError && (
              <div className="text-red-600 text-sm mb-2">{phoneError}</div>
            )}
            {isOtpSent && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700 text-sm">Enter OTP:</label>
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="border border-gray-300 px-3 py-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition text-base"
                  placeholder="Enter OTP"
                />
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full font-semibold shadow transition text-base"
                  onClick={() => verifyOtp(phone, otp)}
                  disabled={otp.length < 4}
                >
                  Verify
                </button>
              </div>
            )}
          </>
        )}
        {step === 'login' && (
          <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mt-4">
            <h2 className="text-lg font-bold text-blue-700 mb-4 text-center">Login</h2>
            <div className="flex flex-col gap-4">
              <input
                name="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Contact Number"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-400 w-full"
              />
              {/* REMOVE invalid contact number message */}
              <input
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="border border-gray-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-400 w-full"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow transition"
              >
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginForm;