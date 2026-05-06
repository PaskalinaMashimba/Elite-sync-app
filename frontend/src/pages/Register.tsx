import React, { useState } from 'react';
import API from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData);
      alert('Account created successfully! You can now sign in.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Server error - checking if backend is awake...');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <h1 className="text-4xl font-bold mb-6 text-[var(--text-h)]">Create Account</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
        <input 
          type="text" placeholder="Full Name" required
          className="p-3 border border-[var(--border)] rounded bg-transparent"
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input 
          type="email" placeholder="Email" required
          className="p-3 border border-[var(--border)] rounded bg-transparent"
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" required
          className="p-3 border border-[var(--border)] rounded bg-transparent"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        <select 
          className="p-3 border border-[var(--border)] rounded bg-transparent"
          onChange={(e) => setFormData({...formData, role: e.target.value})}
        >
          <option value="client">I am a Client</option>
          <option value="provider">I am a Service Provider</option>
        </select>
        <button 
          type="submit" 
          className="bg-[var(--accent)] text-white p-3 rounded font-bold hover:opacity-90 transition-opacity"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;