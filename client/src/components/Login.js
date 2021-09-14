import React, { useState, useContext } from "react";
import { ThemeContext } from "../context/themeContext";
import { Link } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
  // Functional component that logs in the user
  // Set up login component state and context
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(null);
  const { setUser } = useContext(ThemeContext);

  const handleLogin = async (event, email, password) => {
    // Function that logins the user
    try {
      event.preventDefault();
      setAuthError(null);

      // POST request to log in the user
      const url = "http://localhost:5000/user/login";
      const loginBody = { email, password };
      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginBody),
      };
      const response = await fetch(url, options);
      const data = await response.json();
      // Check if successfull authentication
      if (!response.ok || !response.status === 200) {
        setAuthError(data.errors.authorizationError);
        return;
      }
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper"></div>
      <form
        className="login-form"
        onSubmit={(e) => handleLogin(e, emailInput, passwordInput)}
      >
        <h4>alpha</h4>
        <div className="log-input-wrapper">
          <input
            type="email"
            name="email"
            value={emailInput}
            placeholder="Email"
            onChange={(event) => setEmailInput(event.target.value)}
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
          />
        </div>
        <br />
        <span className="error">{authError ? authError : ""}</span>
        <button disabled={emailInput === "" || passwordInput === ""}>
          Log in
        </button>
        <span className="need-account">
          Need an account? <Link to="/signup">Register</Link>
        </span>
      </form>
    </div>
  );
};

export default Login;
