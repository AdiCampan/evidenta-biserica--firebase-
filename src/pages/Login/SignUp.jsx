import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useForm } from "react-hook-form";
import "./Login.css";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const navigate = useNavigate();
  const [signUpError, setSignUpError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reglas de validación
  const emailValidation = {
    required: "Email este obligatorie!",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Adresa de email nu este valida!",
    },
  };

  const passwordValidation = {
    required: "Parola este obligatorie!",
    minLength: {
      value: 6,
      message: "Parola trebuie să aibă cel puțin 6 caractere.",
    },
  };

  const passwordConfirmValidation = (value, context) => {
    return (
      context.getValues("password") === value ||
      "Parolele trebuie sa fie IDENTICE!"
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setSignUpError("");

    try {
      const { email, password } = data;
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      setSignUpError("A apărut o eroare: " + error.message);
      setError("email", { type: "manual", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <section>
        <div className="main-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <p>Inregistreaza-te cu email si parola</p>

            <div>
              <input
                {...register("email", emailValidation)}
                className="input-container"
                type="email"
                placeholder="Adresa de email"
              />
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register("password", passwordValidation)}
                className="input-container"
                type="password"
                placeholder="Parola"
              />
              {errors.password && (
                <p className="error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("passwordConfirm", {
                  required: "Trebuie să confirmi parola!",
                  validate: (value, context) =>
                    passwordConfirmValidation(value, context),
                })}
                className="input-container"
                type="password"
                placeholder="Repeta parola"
              />
              {errors.passwordConfirm && (
                <p className="error">{errors.passwordConfirm.message}</p>
              )}
            </div>

            {signUpError && <p className="error">{signUpError}</p>}

            <div className="button-container">
              <button className="button" type="submit" disabled={loading}>
                {loading ? "Se înregistrează..." : "INREGISTREAZA-TE"}
              </button>
            </div>
          </form>

          <p className="bottom-text">
            Ai deja un cont inregistrat? <NavLink to="/login">Sign in</NavLink>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
