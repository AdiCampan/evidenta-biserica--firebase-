import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase-config';
import { useTranslation } from 'react-i18next';
import { CiUser } from 'react-icons/ci';
import { GoKey } from 'react-icons/go';
import '../Login/Login.css';

const CreateAdmin = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm();
  const navigate = useNavigate();
  const [signUpError, setSignUpError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Reglas de validación
  const emailValidation = {
    required: 'El correo electrónico es obligatorio',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Formato de correo electrónico inválido',
    },
    validate: (value) => {
      return value === 'victor.calatayud.espinosa@gmail.com' || 'Solo se permite crear el usuario administrador especificado';
    }
  };

  const passwordValidation = {
    required: 'La contraseña es obligatoria',
    minLength: {
      value: 6,
      message: 'La contraseña debe tener al menos 6 caracteres',
    },
  };

  const passwordConfirmValidation = (value, formValues) => {
    const password = formValues.password;
    return password === value || 'Las contraseñas no coinciden';
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setSignUpError('');

    try {
      const { email, password } = data;
      
      // 1. Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Enviar correo de verificación
      await sendEmailVerification(user);
      
      // 3. Crear un documento en la colección 'userRoles' para almacenar el rol
      await setDoc(doc(firestore, 'userRoles', user.uid), {
        email: user.email,
        role: 'admin',
        createdAt: new Date(),
        displayName: 'Administrador'
      });
      
      setSignUpSuccess('Usuario administrador creado correctamente. Por favor, verifica tu correo electrónico antes de iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      setLoading(false);
      setSignUpError('Error al crear el usuario: ' + error.message);
      setError('email', { type: 'manual', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <section className="login-section">
        <div className="glass-container">
          <form onSubmit={handleSubmit(onSubmit)} className="modern-form">
            <h2 className="title">Crear Usuario Administrador</h2>

            <div className="input-group">
              <div className="input-icon">
                <CiUser size={24} />
              </div>
              <div className="input-wrapper">
                <input
                  {...register('email', emailValidation)}
                  className="modern-input"
                  type="email"
                  placeholder="Correo electrónico"
                  defaultValue="victor.calatayud.espinosa@gmail.com"
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
                  {...register('password', passwordValidation)}
                  className="modern-input"
                  type="password"
                  placeholder="Contraseña"
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
                  {...register('passwordConfirm', {
                    required: 'Confirma tu contraseña',
                    validate: (value) => passwordConfirmValidation(value, getValues())
                  })}
                  className="modern-input"
                  type="password"
                  placeholder="Confirmar contraseña"
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
                ) : 'Crear Administrador'}
              </button>
            </div>
          </form>

          <div className="button-group" style={{ marginTop: "20px" }}>
            <button
              onClick={() => navigate('/')}
              className="cancel-button"
            >
              Cancelar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CreateAdmin;