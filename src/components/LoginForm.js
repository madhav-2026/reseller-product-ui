import React, { useState } from 'react';

function LoginForm({ onLoginSuccess }) {
  const [step, setStep] = useState('enterPhone'); // enterPhone, otp, register
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

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
      // alert(text);
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
      // Fetch user info after successful OTP verification
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
      // alert(text);
      setIsOtpSent(true); // Show OTP field in registration form
    } else {
      setError(text);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Enter phone number');
      return;
    }
    let exists = await checkPhoneExists(phone);
    // If backend returns an object, check property, else use as is
    if (typeof exists === 'object' && exists !== null) {
      exists = exists.exists || exists.found || exists.phoneExists || false;
    }
    if (exists === true) {
      await sendOtp(phone);
      // setStep('otp'); // Do not change step, keep OTP inline
    } else {
      setError('Phone number not found. Please register.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-4xl font-extrabold">ATO</span>
          </div>
          <div className="text-lg font-bold text-gray-800 mb-1">Any Time Order</div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-1 tracking-tight">
            {step === 'register' ? 'Customer Registration' : 'Login'}
          </h2>
          <p className="text-gray-500 text-sm">
            {step === 'register' ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>
        {error && <div className="text-red-500 mb-4 text-center font-medium">{error}</div>}

        {step === 'enterPhone' && (
          <>
            <label className="block mb-2 font-medium text-gray-700">Contact Number</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="border border-gray-300 px-3 py-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter phone number"
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                onClick={handleSendOtp}
              >
                Send OTP
              </button>
            </div>
            {isOtpSent && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Enter OTP sent to {phone}:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="border border-gray-300 px-3 py-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="Enter OTP"
                />
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full font-semibold shadow transition"
                  onClick={() => verifyOtp(phone, otp)}
                >
                  Verify
                </button>
              </div>
            )}
            <div className="text-center mt-4">
              <span className="text-gray-600">New customer? </span>
              <button
                className="text-purple-700 hover:underline font-semibold"
                onClick={() => { setStep('register'); setError(''); }}
              >
                Register
              </button>
            </div>
          </>
        )}

        {step === 'register' && (
          <>
            <label className="block mb-1 font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="border border-gray-300 px-3 py-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="First Name"
            />
            <label className="block mb-1 font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="border border-gray-300 px-3 py-2 mb-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Last Name"
            />
            <label className="block mb-1 font-medium text-gray-700">Contact Number</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="border border-gray-300 px-3 py-2 flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Contact Number"
                disabled={false}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                onClick={registerUser}
                disabled={false}
              >
                Send OTP
              </button>
            </div>
            {isOtpSent && (
              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Enter OTP:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="border border-gray-300 px-3 py-2 mb-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                  placeholder="Enter OTP"
                />
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full font-semibold shadow transition"
                  onClick={() => verifyOtp(phone, otp)}
                >
                  Verify
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LoginForm;