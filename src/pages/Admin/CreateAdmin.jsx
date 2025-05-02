import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
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
    }
  };

  // Estado para almacenar la lista de correos autorizados desde Firestore
  const [authorizedAdmins, setAuthorizedAdmins] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Cargar la lista de correos autorizados desde Firestore
  useEffect(() => {
    const fetchAuthorizedEmails = async () => {
      try {
        const authorizedCollection = collection(firestore, 'authorizedAdmins');
        const snapshot = await getDocs(authorizedCollection);
        const emailsList = snapshot.docs.map(doc => doc.data().email);
        setAuthorizedAdmins(emailsList);
      } catch (error) {
        console.error('Error al cargar la lista de administradores autorizados:', error);
        // Si hay un error, permitir solo el correo por defecto como fallback
        setAuthorizedAdmins(['victor.calatayud.espinosa@gmail.com']);
      } finally {
        setCheckingAuth(false);
      }
    };

    fetchAuthorizedEmails();
  }, []);
  
  // Verificar si el correo está en la lista de administradores autorizados
  const isAuthorizedAdmin = async (email) => {
    // Verificar primero en la lista cargada en memoria
    if (authorizedAdmins.includes(email)) return true;
    
    // Si no está en la lista en memoria, verificar directamente en Firestore
    // (esto es útil si otro administrador acaba de añadir un nuevo correo autorizado)
    try {
      const authorizedCollection = collection(firestore, 'authorizedAdmins');
      const q = query(authorizedCollection, where('email', '==', email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error al verificar autorización en Firestore:', error);
      return false;
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
      
      // Verificar si el correo está autorizado para ser administrador
      const isAuthorized = await isAuthorizedAdmin(email);
      if (!isAuthorized) {
        setSignUpError('Este correo electrónico no está autorizado para crear una cuenta de administrador.');
        setError('email', { 
          type: 'manual', 
          message: 'Correo electrónico no autorizado para ser administrador' 
        });
        setLoading(false);
        return;
      }
      
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

  // Mostrar un indicador de carga mientras se verifica la lista de autorizados
  if (checkingAuth) {
    return (
      <main className="login">
        <section className="login-section">
          <div className="glass-container" style={{ textAlign: "center" }}>
            <div className="spinner"></div>
            <p style={{ color: "white", marginTop: "20px" }}>
              Cargando configuración...
            </p>
          </div>
        </section>
      </main>
    );
  }

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
                  defaultValue=""
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
              onClick={() => navigate('/admin/manage')}
              className="secondary-button"
              style={{ marginRight: '10px' }}
            >
              Gestionar Administradores
            </button>
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