import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebase-config";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CiUser } from "react-icons/ci";
import { GoKey } from "react-icons/go";
import { generateCSRFToken, verifyCSRFToken } from "../../utils/csrf";
import { isBlocked, getRemainingBlockTime } from "../../utils/bruteForceProtection";
import { useTranslation } from "react-i18next";
import "./Login.css";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  
  useEffect(() => {
    // Generar token CSRF al cargar el componente
    setCsrfToken(generateCSRFToken());
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();

  const onLogin = ({ email, password }) => {
    // Verificar token CSRF
    if (!verifyCSRFToken(csrfToken)) {
      setLoginError(t('login.errors.security'));
      return;
    }
    
    // Verificar si el usuario está bloqueado por intentos fallidos
    if (isBlocked(email)) {
      const remainingTime = getRemainingBlockTime(email);
      setLoginError(t('login.errors.blocked', { minutes: Math.ceil(remainingTime / 60) }));
      return;
    }
    
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        
        // Verificar si el correo está verificado
        if (!user.emailVerified) {
          setLoginError(t('login.errors.unverified'));
          signOut(auth); // Cerrar sesión si el correo no está verificado
          return;
        }
        
        setLoginError("");
        navigate("/persoane");
      })
      .catch((error) => {
        setLoginError(t('login.errors.invalidCredentials'));
        console.log(error.code, error.message);
      })
      .finally(() => setLoading(false));
  };

  const handleResendVerification = (email) => {
    if (!email) {
      setLoginError(t('login.email.error.required'));
      return;
    }

    setLoading(true);
    signInWithEmailAndPassword(auth, email, getValues("password"))
      .then((userCredential) => {
        sendEmailVerification(userCredential.user)
          .then(() => {
            setLoginError(t('login.errors.verificationSent'));
          })
          .catch((error) => {
            setLoginError("Error al reenviar el correo: " + error.message);
          });
      })
      .catch((error) => {
        setLoginError(t('login.errors.invalidCredentials'));
      })
      .finally(() => setLoading(false));
  };

  const handlePasswordReset = () => {
    const email = getValues("email");
    if (!email) {
      setLoginError(t('login.email.error.required'));
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
      <section className="login-section">
        <div className="glass-container">
          <h2 className="title">{t('login.title')}</h2>
          
          <form onSubmit={handleSubmit(onLogin)} className="modern-form">
            <input type="hidden" name="csrf_token" value={csrfToken} />
            
            <div className="input-group">
              <div className="input-icon">
                <CiUser size={24} />
              </div>
              <div className="input-wrapper">
                <input
                  {...register("email", {
                    required: t('login.email.error.required'),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('login.email.error.invalid'),
                    },
                  })}
                  className="modern-input"
                  type="email"
                  placeholder={t('login.email.placeholder')}
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
                  {...register("password", {
                    required: t('login.password.error.required'),
                    minLength: {
                      value: 6,
                      message: t('login.password.error.minLength'),
                    },
                  })}
                  className="modern-input"
                  type="password"
                  placeholder={t('login.password.placeholder')}
                />
                {errors.password && (
                  <p className="error-message">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="button-group">
              <button 
                className={`primary-button ${loading ? 'loading' : ''}`}
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : t('login.button')}
              </button>
            </div>
          </form>
          <div className="button-group" style={{ marginTop: "20px" }}>
            <button
              onClick={() => navigate("/")}
              className="cancel-button"
            >
              {t('login.cancel')}
            </button>
          </div>

          {loginError && (
            <>
              <p className="forgot-password" onClick={handlePasswordReset}>
                {t('login.forgotPassword')}
              </p>
              {loginError.includes("verifica tu correo") && (
                <p 
                  className="forgot-password" 
                  onClick={() => handleResendVerification(getValues("email"))}
                  style={{marginTop: '10px'}}
                >
                  {t('login.resendVerification')}
                </p>
              )}
            </>
          )}
          {loginError && <p className="error-message">{loginError}</p>}
        </div>
      </section>
    </main>
  );
};

export default Login;
