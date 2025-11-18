import React from 'react'
import Link from 'next/link'
import './loginbox.css' // Reusing the same CSS file

function RegisterBox() {
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
                <form className="auth-form" id="registerForm">
                  <div className="form-group">
                    <label htmlFor="username">
                      <i className="fas fa-user" />
                      Username
                    </label>
                    <input
                      type="text"
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
                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <i className="fas fa-lock" />
                      Confirm Password
                    </label>
                    <div className="password-input">
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
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
