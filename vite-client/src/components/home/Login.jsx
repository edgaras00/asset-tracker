import { useState, useContext } from "react";
import { AppContext } from "../../context/appContext";
import { Link } from "react-router-dom";

import { setRequestOptions } from "../../utils/utils";

import "./styles/login.css";

const Login = () => {
  // Set up login component state and context
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(null);
  const { setUser, setToken } = useContext(AppContext);

  const handleLogin = async (event, email, password) => {
    event.preventDefault();
    setLoginError(null);
    // Function that logins the user
    try {
      // POST request to log in the user
      let url = "https://alpha-assets-api.onrender.com/user/login";
      if (import.meta.env.REACT_APP_ENV === "development") {
        url = "/user/login";
      }

      const requestOptions = setRequestOptions("POST", { email, password });
      const response = await fetch(url, requestOptions);

      if (response.status !== 200) {
        if (response.status === 401) {
          const error = new Error("Email or password is incorrect.");
          error.name = "authError";
          throw error;
        } else if (response.status === 500) {
        }
        throw new Error("Something went wrong. Please try again later.");
      }

      const data = await response.json();

      // Log in user
      setUser(data.data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("token", data.token);
    } catch (error) {
      console.error(error);
      setLoginError(error.message);
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
        <span className="error">{loginError ? loginError : ""}</span>
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
