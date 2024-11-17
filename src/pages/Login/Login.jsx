import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebase-config";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CiUser } from "react-icons/ci";
import { GoKey } from "react-icons/go";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
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
        setLoginError("Utilizator sau parola incorecta");
        console.log(error.code, error.message);
      })
      .finally(() => setLoading(false));
  };

  const handlePasswordReset = () => {
    const email = getValues("email");
    if (!email) {
      setLoginError("Por favor, introduce tu correo electrónico.");
      return;
    }

    setLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setLoginError(
          "Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico."
        );
      })
      .catch((error) => {
        setLoginError(
          "Error al enviar el correo de recuperación: " + error.message
        );
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
              <CiUser size={30} />
              <input
                {...register("email", {
                  required: "Email este obligatoriu!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "email invalid!",
                  },
                })}
                className="input-container"
                type="email"
                placeholder="Introdu email"
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div>
              <GoKey size={20} style={{ margin: "5px" }} />
              <input
                {...register("password", {
                  required: "Parola e obligatorie!",
                  minLength: {
                    value: 6,
                    message: "Parola trebuia sa aiba cel putin 6 caractere !",
                  },
                })}
                className="input-container"
                type="password"
                placeholder="Parola"
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>

            <div className="button-container">
              <button className="button" disabled={loading}>
                {loading ? "Iniciando sesión..." : "LOGIN"}
              </button>
            </div>
          </form>
          {loginError && (
            <p className="forgot-password" onClick={handlePasswordReset}>
              Ai uitat parola?
            </p>
          )}
          {loginError && <p className="error">{loginError}</p>}
        </div>
      </section>
    </main>
  );
};

export default Login;
