import React, { useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";

const PersonSelectionModal = ({ show, onHide, matches, onSelect }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Seleccioneaza o persoana</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Persoana se afla deja in Baza de Date! Seleccioneaza:</p>
        <ListGroup>
          {matches?.map((person) => (
            <ListGroup.Item
              key={person.id}
              action
              onClick={() => onSelect(person)}
            >
              {`${person.firstName} ${person.lastName} - Dirección: ${
                person.address || "Desconocida"
              }`}
            </ListGroup.Item>
          ))}
          <ListGroup.Item action onClick={() => onSelect(null)}>
            Adsauga o persoana noua
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default PersonSelectionModal;
