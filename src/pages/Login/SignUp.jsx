import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CiUser } from "react-icons/ci";
import { GoKey } from "react-icons/go";
import "./Login.css";


const Signup = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const navigate = useNavigate();
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Reglas de validación
  const emailValidation = {
    required: t('signup.email.error.required'),
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: t('signup.email.error.invalid'),
    },
  };

  const passwordValidation = {
    required: t('signup.password.error.required'),
    minLength: {
      value: 6,
      message: t('signup.password.error.minLength'),
    },
  };

  const passwordConfirmValidation = (value, context) => {
    return (
      context.getValues("password") === value ||
      t('signup.passwordConfirm.error.mismatch')
    );
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setSignUpError("");

    try {
      const { email, password } = data;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Enviar correo de verificación
      await sendEmailVerification(userCredential.user);
      
      setSignUpSuccess("Cuenta creada correctamente. Por favor, verifica tu correo electrónico antes de iniciar sesión.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
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
      <section className="login-section">
        <div className="glass-container">
          <form onSubmit={handleSubmit(onSubmit)} className="modern-form">
            <h2 className="title">{t('signup.title')}</h2>

            <div className="input-group">
              <div className="input-icon">
                <CiUser size={24} />
              </div>
              <div className="input-wrapper">
                <input
                  {...register("email", emailValidation)}
                  className="modern-input"
                  type="email"
                  placeholder={t('signup.email.placeholder')}
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>
            </div>

            <div className="input-group">
              <div className="input-icon">
                <GoKey size={24} />
              </div>
              <div className="input-wrapper">
                <input
                  {...register("password", passwordValidation)}
                  className="modern-input"
                  type="password"
                  placeholder={t('signup.password.placeholder')}
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="input-group">
              <div className="input-icon">
                <GoKey size={24} />
              </div>
              <div className="input-wrapper">
                <input
                  {...register("passwordConfirm", {
                    required: t('signup.passwordConfirm.error.required'),
                    validate: (value, context) =>
                      passwordConfirmValidation(value, context),
                  })}
                  className="modern-input"
                  type="password"
                  placeholder={t('signup.passwordConfirm.placeholder')}
                />
                {errors.passwordConfirm && (
                  <p className="error-message">{errors.passwordConfirm.message}</p>
                )}
              </div>
            </div>

            {signUpError && <p className="error-message">{signUpError}</p>}
            {signUpSuccess && <p className="success-message" style={{color: '#4CAF50', marginTop: '10px'}}>{signUpSuccess}</p>}

            <div className="button-group">
              <button 
                className={`primary-button ${loading ? 'loading' : ''}`} 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : t('signup.button')}
              </button>
            </div>
          </form>

          <p className="bottom-text">
            {t('signup.haveAccount')} <NavLink to="/login">{t('signup.signIn')}</NavLink>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
