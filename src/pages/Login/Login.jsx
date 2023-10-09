import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase-config";
import { NavLink, useNavigate } from "react-router-dom";
import "./Login.css";
import { useForm } from "react-hook-form";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const emailValidation = {
    required: {
      value: true,
      message: "Email e obligatoriu !",
    },
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Adresa de email nu este valida !",
    },
  };
  const passwordConfirmValidation = {
    required: {
      value: true,
      message: "Trebuie sa confirmi parola",
    },
    validate: (val) => {
      if (watch("password") != val) {
        return "Parolele trebuie sa fie IDENTICE !";
      }
    },
  };

  const onLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigate("/persoane");
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <>
      <main className="login">
        <section>
          <div className="main-container">
            <p>Introduceti e-mailul si parola </p>

            <form onSubmit={handleSubmit(onLogin)}>
              <div>
                {/* <label htmlFor="email-address">Email address</label> */}
                <input
                  {...register("email", emailValidation)}
                  className="input-container"
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="introdu adresa de email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="error">Email obligatoriu.</p>}
              </div>

              <div className="input-container">
                {/* <label htmlFor="password">Password</label> */}
                <input
                  {...register("password", { required: true })}
                  className="input-container"
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="error">Lipseste parola.</p>}
              </div>

              <div className="button-container">
                <button className="button">LOGIN</button>
              </div>
            </form>

            <p className="text">
              No account yet? <NavLink to="/signup">Sign up</NavLink>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Login;
