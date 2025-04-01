import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { useGetChurchesQuery, useAddChurchMutation, useDelChurchMutation} from '../services/churches';
import './Biserici.css'
import Confirmation from '../Confirmation';
import { validateChurch, sanitizeText } from '../utils/validation';

function Biserici() {
  const [church, setChurch] = useState("");
  const [place, setPlace] = useState("");
  const [error, setError] = useState("");


  const {data, error: apiError, isLoading, isFetching } = useGetChurchesQuery();
  const [addChurch, result] = useAddChurchMutation();
  const [delChurch] = useDelChurchMutation();
  const [idToDelete, setIdToDelete] = useState(null);

  function addData() {
    // Sanitizar entradas
    const sanitizedChurch = sanitizeText(church);
    const sanitizedPlace = sanitizeText(place);
    
    if (sanitizedChurch && sanitizedPlace) {
      // Validar datos usando la función de validación
      const churchData = {
        name: sanitizedChurch,
        address: sanitizedPlace
      };
      
      const { isValid, errors } = validateChurch(churchData);
      
      if (isValid) {
        addChurch(churchData);
        setChurch("");
        setPlace("");
        setError("");
      } else {
        // Mostrar el primer error encontrado
        setError(Object.values(errors)[0]);
      }
    } else {
      setError("Todos los campos son obligatorios");
    }
  };

  function deleteBiserica(id) {
    delChurch(id);
    setIdToDelete(null);
  };

  return (
    <div className="biserici" >
      {isLoading ? <p>Loading</p> : null}
      {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
      {apiError && <div className="error-message" style={{color: 'red'}}>Error de API: {apiError.message}</div>}
      <button onClick={addData}>Adauga</button>
      <input
        placeholder="Numele Bisericii"
        value={church}
        onChange={(event) => setChurch(event.target.value)}
        maxLength={100}
      ></input>
      <input
        placeholder="Localitatea"
        value={place}
        onChange={(event) => setPlace(event.target.value)}
        maxLength={200}
      ></input>
      <div className="lista_biserici">
        Lista Biserici
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Nume</th>
              <th>Localitate</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {data ? data.map((biserica, index) => (
              <tr key={biserica.id}>
                <td>{index + 1}</td>
                <td>{biserica.name}</td>
                <td>{biserica.address}</td>
                <td>
                  <Button variant="primary">Modifica</Button>
                  <Button variant="primary" onClick={() => setIdToDelete(biserica.id)} >Sterge</Button>
                </td>
              </tr>
            )) : null}
          </tbody>
        </Table>
      </div>
      <Confirmation
        showModal={idToDelete != null}
        id={idToDelete}
        confirmModal={(id) => deleteBiserica(id)}
        message="Esti sigur ca vrei sa stergi persoana din baza de date ?"
        hideModal={(id) => setIdToDelete(null)}
      />
    </div>
  )
};

export default Biserici;