import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase-config";
import "./Login.css";
import { useForm } from "react-hook-form";

const Signup = () => {
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

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState(false);

  const onSubmit = async () => {
    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("/login");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        // ..
      });
  };

  return (
    <main className="login">
      <section>
        <div className="main-container">
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <p> Inregistreaza-te cu email si parola</p>
              <div>
                {/* <label htmlFor="email-address">Email address</label> */}
                <input
                  {...register("email", emailValidation)}
                  className="input-container"
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email address"
                />
                {errors.email && (
                  <p className="error">{errors.email.message}</p>
                )}
              </div>

              <div>
                {/* <label htmlFor="password">Password</label> */}
                <input
                  className="input-container"
                  type="password"
                  label="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Parola"
                />
              </div>
              <div>
                {/* <label htmlFor="password">Password</label> */}
                <input
                  {...register("passwordConfirm", passwordConfirmValidation)}
                  className="input-container"
                  type="password"
                  label="Create password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  placeholder="Repeta parola"
                />
                {errors.passwordConfirm && (
                  <p className="error">{errors.passwordConfirm.message}</p>
                )}
              </div>

              <div className="button-container">
                <button className="button" type="submit">
                  INREGISTREAZA-TE
                </button>
              </div>
            </form>

            <p className="bottom-text">
              Ai deja un cont inregistrat ?{" "}
              <NavLink to="/login">Sign in</NavLink>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
