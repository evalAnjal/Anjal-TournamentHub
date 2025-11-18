import React from 'react'
import Link from 'next/link'
import './loginbox.css'

function LoginBox() {
  return (
    <>
    <div id="app">
    {/* Mobile App Container */}
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
        {/* Login Form */}
        <div className="auth-form-container">
          <div className="auth-card glass-card">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>
            <form className="auth-form" id="loginForm">
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope" />
                  Email or Username
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Enter your email or username"
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
                    id="password"
                    name="password"
                    placeholder="Enter your password"
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
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" id="remember" />
                  <span className="checkmark" />
                  Remember me
                </label>
                <a href="#" className="forgot-password">
                  Forgot Password?
                </a>
              </div>
              <button type="submit" className="auth-btn primary-btn">
                <i className="fas fa-sign-in-alt" />
                LOGIN
              </button>
                <div className="signup-link">
                    Don't have an account? <Link href="/register">Sign Up</Link>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
  )
}

export default LoginBox;