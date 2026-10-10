
import { useState } from "react";
import { Pill, User, LockKeyhole, Eye, EyeOff } from "lucide-react";
import API from "../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await API.post("/auth/register", { username, password });
        setIsRegister(false);
        setPassword("");
        setError("Account created successfully. Please sign in.");
      } else {
        await API.post("/auth/login", { username, password });
        onLogin();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isRegister ? "Account creation failed." : "Login failed. Check your details.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Pill size={32} />
        </div>

        <h1>PharmaTrack</h1>
        <p className="login-subtitle">
          Smart Pharmacy Inventory Management
        </p>

        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
        <p className="login-description">
          {isRegister
            ? "Register to access PharmaTrack"
            : "Sign in to access your dashboard"}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <div className="login-input">
            <User size={18} />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <label>Password</label>
          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? "Minimum 8 characters" : "Enter password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p
              className="login-error"
              style={{ color: error.startsWith("Account created") ? "green" : undefined }}
            >
              {error}
            </p>
          )}

          <button className="login-button" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p className="login-description">
          {isRegister ? "Already have an account?" : "New to PharmaTrack?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setPassword("");
            }}
            style={{
              border: "none",
              background: "none",
              color: "#2563eb",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </p>

        <p className="login-footer">PharmaTrack Inventory Management</p>
      </div>
    </div>
  );
}

export default Login;
