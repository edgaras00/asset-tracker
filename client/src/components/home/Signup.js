import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/appContext";

import "./styles/signup.css";

const Signup = () => {
  // Component that signs up a new user
  console.log(process.env.NODE_ENV);
  // Set up component state and context
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [repeatPasswordInput, setRepeatPasswordInput] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [serverErrors, setServerErrors] = useState(null);
  const { setUser } = useContext(AppContext);

  const signUp = async (event, email, password, repeatPassword) => {
    // Function that sends a POST request to the server to sign up a new user
    try {
      event.preventDefault();
      setServerErrors(null);
      // Check if both entered passwords are the same
      if (password !== repeatPassword) {
        setSignUpError("Passwords do not match!");
        setRepeatPasswordInput("");
        return;
      }
      setSignUpError("");
      // API URL and request body / options
      let url = "https://track-investments.herokuapp.com/user/signup";
      if (process.env.NODE_ENV === "development") {
        url = "/user/signup";
      }
      console.log(url);
      const signUpBody = {
        email,
        password,
      };

      const options = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpBody),
      };
      // POST request that signs up and logs in a new user
      const response = await fetch(url, options);

      if (response.status === 500) {
        throw new Error("Something went wrong. Please try again later.");
      }

      const responseData = await response.json();

      if (response.status !== 201) {
        if (
          response.status === 400 &&
          responseData.message.startsWith("Duplicate")
        ) {
          throw new Error("User with this email already exists");
        }
        throw new Error("Something went wrong. Please try again later.");
      }

      if (response.ok || response.status === 201) {
        setUser(responseData.data.user);
        localStorage.setItem("user", JSON.stringify(responseData.data.user));
        return;
      } else {
        setServerErrors(responseData);
        return;
      }
    } catch (error) {
      console.log(error);
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
            {/* <span>{serverErrors ? serverErrors.errors.email : null}</span> */}
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
