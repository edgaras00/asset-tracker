import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/appContext";

import { setRequestOptions } from "../../utils/utils";

import "./styles/signup.css";

const Signup = () => {
  // Component that signs up a new user
  // Set up component state and context
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [repeatPasswordInput, setRepeatPasswordInput] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [serverErrors, setServerErrors] = useState(null);
  const { setUser } = useContext(AppContext);

  const signUp = async (event, email, password, repeatPassword) => {
    // Function that sends a POST request to the server to sign up a new user
    event.preventDefault();
    setServerErrors(null);

    // Check if all inputs filled
    if (!email || !password || !repeatPassword) {
      setSignUpError("Please fill in all of the fields.");
      return;
    }

    // Check if both entered passwords are the same
    if (password !== repeatPassword) {
      setSignUpError("Passwords do not match!");
      setRepeatPasswordInput("");
      return;
    }

    try {
      setSignUpError("");
      // API URL and request body / options
      let url = "https://alpha-assets-api.onrender.com/user/signup";
      // if (process.env.REACT_APP_ENV === "development") {
      //   url = "/user/signup";
      // }

      // Send user info as a POST request
      const requestOptions = setRequestOptions("POST", { email, password });
      const response = await fetch(url, requestOptions);

      // Error handling
      if (!response.ok || response.status !== 201) {
        if (
          response.status === 400 &&
          responseData.message.startsWith("Duplicate")
        ) {
          throw new Error("User with this email already exists");
        }
        throw new Error("Something went wrong. Please try again later.");
      }

      const responseData = await response.json();

      // Log in user
      setUser(responseData.data.user);
      localStorage.setItem("user", JSON.stringify(responseData.data.user));
      localStorage.setItem("token", responseData.token);
    } catch (error) {
      console.error(error);
      setServerErrors(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-bg"></div>
      <form
        className="signup-form"
        onSubmit={(event) =>
          signUp(event, emailInput, passwordInput, repeatPasswordInput)
        }
      >
        <h4>alpha</h4>
        <div className="create-account">
          <h3>Create Your Account</h3>
        </div>
        <div className="signup-input-wrapper">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={emailInput}
            onChange={(event) => setEmailInput(event.target.value)}
          />
          <div className="pass-length">
            <span>{serverErrors ? serverErrors : null}</span>
          </div>
          <br />
          <input
            type="password"
            name="password"
            placeholder="Password"
            minLength={6}
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
          />
          <div className="pass-length">
            <span>
              {passwordInput.length < 6
                ? "Password must be at least 6 characters."
                : null}
            </span>
          </div>
          <br />
          <input
            type="password"
            required={true}
            name="repeatPassword"
            placeholder="Repeat password"
            minLength={6}
            value={repeatPasswordInput}
            onChange={(e) => setRepeatPasswordInput(e.target.value)}
          />
        </div>
        <br />
        {signUpError !== "" ? (
          <div className="signup-err">
            <span>{signUpError}</span>
          </div>
        ) : null}
        <button
          className="signup-link"
          disabled={passwordInput.length < 6 && repeatPasswordInput.length < 6}
        >
          Sign up
        </button>
        <span className="has-account">
          <Link to="/login">Already have an account?</Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
