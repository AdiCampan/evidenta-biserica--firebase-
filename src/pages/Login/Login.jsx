import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase-config";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onLogin = ({ email, password }) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setLoginError("");
        const user = userCredential.user;
        navigate("/persoane");
        console.log(user);
      })
      .catch((error) => {
        setLoginError("Error al iniciar sesión: " + error.message);
        console.log(error.code, error.message);
      })
      .finally(() => setLoading(false));
  };

  return (
    <main className="login">
      <section>
        <div className="main-container">
          <p>LOG IN</p>

          <form onSubmit={handleSubmit(onLogin)}>
            <div>
              <input
                {...register("email", {
                  required: "Email este obligatorie!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Adresa de email nu este valida!",
                  },
                })}
                className="input-container"
                type="email"
                placeholder="Introdu adresa de email"
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div className="input-container">
              <input
                {...register("password", {
                  required: "Parola este obligatorie!",
                  minLength: {
                    value: 6,
                    message: "Parola trebuie să aibă cel puțin 6 caractere.",
                  },
                })}
                className="input-container"
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>

            {loginError && <p className="error">{loginError}</p>}

            <div className="button-container">
              <button className="button" disabled={loading}>
                {loading ? "Iniciando sesión..." : "LOGIN"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Login;
