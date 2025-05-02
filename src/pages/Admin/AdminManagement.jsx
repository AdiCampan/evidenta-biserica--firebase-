import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import { useTranslation } from 'react-i18next';
import { CiUser } from 'react-icons/ci';
import '../Login/Login.css';

const AdminManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authorizedEmails, setAuthorizedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar la lista de correos autorizados desde Firestore
  useEffect(() => {
    const fetchAuthorizedEmails = async () => {
      try {
        const authorizedCollection = collection(firestore, 'authorizedAdmins');
        const snapshot = await getDocs(authorizedCollection);
        const emailsList = snapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email
        }));
        setAuthorizedEmails(emailsList);
      } catch (err) {
        setError('Error al cargar la lista de administradores autorizados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorizedEmails();
  }, []);

  // Validar formato de correo electrónico
  const isValidEmail = (email) => {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
  };

  // Añadir un nuevo correo autorizado
  const addAuthorizedEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newEmail.trim()) {
      setError('Por favor, introduce un correo electrónico');
      return;
    }

    if (!isValidEmail(newEmail)) {
      setError('Por favor, introduce un correo electrónico válido');
      return;
    }

    // Verificar si el correo ya está en la lista
    const emailExists = authorizedEmails.some(item => item.email.toLowerCase() === newEmail.toLowerCase());
    if (emailExists) {
      setError('Este correo electrónico ya está autorizado');
      return;
    }

    setLoading(true);
    try {
      // Añadir el nuevo correo a Firestore
      const authorizedCollection = collection(firestore, 'authorizedAdmins');
      const docRef = await addDoc(authorizedCollection, {
        email: newEmail,
        createdAt: new Date()
      });

      // Actualizar la lista local
      setAuthorizedEmails([...authorizedEmails, { id: docRef.id, email: newEmail }]);
      setNewEmail('');
      setSuccess('Correo electrónico autorizado añadido correctamente');
    } catch (err) {
      setError('Error al añadir el correo electrónico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un correo autorizado
  const removeAuthorizedEmail = async (id, email) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${email} de la lista de administradores autorizados?`)) {
      return;
    }

    setLoading(true);
    try {
      // Eliminar el correo de Firestore
      await deleteDoc(doc(firestore, 'authorizedAdmins', id));

      // Actualizar la lista local
      setAuthorizedEmails(authorizedEmails.filter(item => item.id !== id));
      setSuccess('Correo electrónico eliminado de la lista de autorizados');
    } catch (err) {
      setError('Error al eliminar el correo electrónico: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <section className="login-section">
        <div className="glass-container">
          <h2 className="title">Gestión de administradores autorizados</h2>

          <form onSubmit={addAuthorizedEmail} className="modern-form">
            <div className="input-group">
              <div className="input-icon">
                <CiUser size={24} />
              </div>
              <div className="input-wrapper">
                <input
                  className="modern-input"
                  type="email"
                  placeholder="Correo electrónico a autorizar"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message" style={{color: '#4CAF50', marginTop: '10px'}}>{success}</p>}

            <div className="button-group">
              <button 
                className={`primary-button ${loading ? 'loading' : ''}`} 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : 'Añadir administrador autorizado'}
              </button>
            </div>
          </form>

          <div className="admin-list" style={{ marginTop: '20px' }}>
            <h3>Administradores autorizados</h3>
            {authorizedEmails.length === 0 ? (
              <p>No hay administradores autorizados</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {authorizedEmails.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px' }}>
                    <span>{item.email}</span>
                    <button 
                      onClick={() => removeAuthorizedEmail(item.id, item.email)}
                      style={{ background: 'rgba(255, 0, 0, 0.7)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="button-group" style={{ marginTop: "20px" }}>
            <button
              onClick={() => navigate('/admin/create')}
              className="secondary-button"
              style={{ marginRight: '10px' }}
            >
              Crear Administrador
            </button>
            <button
              onClick={() => navigate('/')}
              className="cancel-button"
            >
              Volver
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminManagement;