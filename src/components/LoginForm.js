import React, { useState, useEffect, useRef } from 'react';

function LoginForm({ onLoginSuccess }) {
  const [step, setStep] = useState('enterPhone');
  const [phone, setPhone] = useState('+91'); // Default value is +91
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Focus input on step change for better mobile UX
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

  // Register user
  const registerUser = async () => {
    if (!firstName || !lastName || !phone) {
      setError('All fields are required');
      return;
    }
    const res = await fetch('http://localhost:9090/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, phone }),
    });
    const text = await res.text();
    if (res.ok) {
      setError('');
      setIsOtpSent(true);
    } else {
      setError(text);
    }
  };

  const handleSendOtp = async () => {
    const digitsOnly = phone.slice(3).replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      setError('Please enter a valid 10 digit phone number with +91');
      return;
    }
    let exists = await checkPhoneExists(phone);
    if (typeof exists === 'object' && exists !== null) {
      exists = exists.exists || exists.found || exists.phoneExists || false;
    }
    if (exists === true) {
      await sendOtp(phone);
    } else {
      setError('Contact number not found. Please register.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-sm mx-2 p-4 sm:p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-extrabold">ATO</span>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-700 mt-3 text-center">Please Login</span>
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
                onChange={e => {
                  // Keep +91 at the start, allow only digits after
                  let val = e.target.value;
                  if (!val.startsWith('+91')) {
                    val = '+91' + val.replace(/\D/g, '').slice(0, 10);
                  } else {
                    val = '+91' + val.slice(3).replace(/\D/g, '').slice(0, 10);
                  }
                  setPhone(val);
                  setError('');
                }}
                onBlur={() => {
                  const digitsOnly = phone.slice(3).replace(/\D/g, '');
                  if (digitsOnly.length < 10) {
                    setError('Invalid contact number');
                  }
                }}
                className="border border-gray-300 px-3 py-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                placeholder="Enter phone number (+91XXXXXXXXXX)"
                autoFocus
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition text-base"
                onClick={handleSendOtp}
                disabled={phone.length !== 13}
                style={{ minWidth: '90px' }}
              >
                Send OTP
              </button>
            </div>
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
            <label className="block mb-1 font-medium text-gray-700 text-sm">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="border border-gray-300 px-3 py-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
              placeholder="First Name"
            />
            <label className="block mb-1 font-medium text-gray-700 text-sm">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="border border-gray-300 px-3 py-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
              placeholder="Last Name"
            />
            <label className="block mb-1 font-medium text-gray-700 text-sm">Contact Number</label>
            <div className="flex gap-2 mb-4">
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                  setError('');
                }}
                className="border border-gray-300 px-3 py-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                placeholder="Contact Number"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition text-base"
                onClick={registerUser}
                disabled={phone.replace(/\D/g, '').length !== 10 || phone.includes('+91')}
                style={{ minWidth: '90px' }}
              >
                Send OTP
              </button>
            </div>
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
            <div className="text-center mt-2">
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => { setStep('enterPhone'); setError(''); setIsOtpSent(false); }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginForm;