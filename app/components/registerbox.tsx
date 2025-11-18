'use client'
import React from 'react';
import {useState} from 'react';
import Link from 'next/link'
import './loginbox.css' // Reusing the same CSS file

function RegisterBox() {
    const [fullName,setFullName] = useState("");
    const [email,setEmail]= useState("");
    const [password,setPassword]= useState("");
    

    const handleSubmit= async (e: React.FormEvent) =>{
        e.preventDefault();

        const formData = {full_name: fullName, email, password};

        const res = await fetch('/api/auth/register',{
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify(formData),
        })

        const returned_user_ddata = await res.json()
        console.log(returned_user_ddata)


    }

  return (
    <>
      <div id="app">
        {/* Main App Container */}
        <div className="main-container">
          {/* Auth Background */}
          <div className="auth-background">
            <div className="background-overlay" />
          </div>
          {/* Auth Content */}
          <div className="auth-container">
            {/* Logo Section */}
            <div className="auth-logo">
              <div className="logo-icon">
                <i className="fas fa-crosshairs" />
              </div>
              <h1 className="logo-text">CLASH HUB</h1>
              <p className="logo-tagline">Tournament Platform</p>
            </div>
            {/* Register Form */}
            <div className="auth-form-container">
              <div className="auth-card glass-card">
                <div className="auth-header">
                  <h2>Create Account</h2>
                  <p>Join the tournament platform</p>
                </div>
                <form className="auth-form" id="registerForm" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username">
                      <i className="fas fa-user" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e=> setFullName(e.target.value)}
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fas fa-envelope" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e=> setEmail(e.target.value)}
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">
                      <i className="fas fa-lock" />
                      Password
                    </label>
                    <div className="password-input">
                      <input
                        type="password"
                        value={password}
                        onChange={e=> setPassword(e.target.value)}
                        id="password"
                        name="password"
                        placeholder="Create a password"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                      >
                        <i className="fas fa-eye" />
                      </button>
                    </div>
                  </div>
                
                  <button type="submit" className="auth-btn primary-btn">
                    <i className="fas fa-user-plus" />
                    CREATE ACCOUNT
                  </button>
                </form>
                <div className="signup-link">
                  Already have an account? <Link href="/login">Sign In</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RegisterBox;
