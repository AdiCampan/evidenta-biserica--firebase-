import React, { useEffect, useRef, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase-config";
import "./ImageUploader.scss";

const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png"];
const EMPTY_IMAGE = "/images/person-placeholder.jpg";

// Función para convertir de hexadecimal a base64
const hexToBase64 = (hexString) => {
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }
  const hexArray = hexString.match(/.{1,2}/g) || [];
  const byteArray = new Uint8Array(hexArray.map((byte) => parseInt(byte, 16)));
  const base64String = btoa(String.fromCharCode(...byteArray));
  return `data:image/jpeg;base64,${base64String}`;
};

const FileUploader = ({
  id,
  onFileSelectSuccess,
  onFileSelectError,
  initialImage, // La cadena en hexadecimal de la imagen original
}) => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(EMPTY_IMAGE); // Vista previa de la imagen
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    // Si `initialImage` viene en hexadecimal, conviértelo a base64
    if (initialImage && initialImage.startsWith("0x")) {
      const base64Image = hexToBase64(initialImage);
      setImagePreview(base64Image);
    } else {
      setImagePreview(initialImage || EMPTY_IMAGE);
    }
  }, [initialImage]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectFile = () => {
    setFileError(null);

    if (fileInputRef.current?.files) {
      const currentFile = fileInputRef.current.files[0];
      const extension = currentFile.name.split(".").pop();

      if (ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
        setFileError(
          "Se pueden cargar solo imágenes con extensión .jpg, .jpeg y .png"
        );
        onFileSelectError(true);
      } else if (currentFile.size > 10_000_000) {
        setFileError("Se pueden cargar solo imágenes de máximo 10MB");
        onFileSelectError(true);
      } else {
        const fileRef = ref(storage, id); // Define la referencia del archivo
        // Sube la imagen al almacenamiento de Firebase
        uploadBytes(fileRef, currentFile).then((snapshot) => {
          getDownloadURL(ref(storage, id))
            .then((url) => {
              if (url) {
                onFileSelectSuccess(url); // Asegúrate de que `url` sea válida antes de llamarla
                setImagePreview(url); // Actualiza la vista previa
              } else {
                setFileError(
                  "No se pudo obtener una URL válida para la imagen."
                );
                onFileSelectError({ error: "No se pudo obtener la URL" });
              }
            })
            .catch((error) => {
              console.error("Error al obtener la URL de descarga:", error);
              setFileError("Error al obtener la URL de la imagen.");
              onFileSelectError({ error });
            });
        });
      }
    }
  };

  return (
    <div className="file-uploader-wrapper">
      <div className="file-uploader">
        <input
          ref={fileInputRef}
          onChange={handleSelectFile}
          id="input-file"
          className="d-none"
          type="file"
        />
        {/* Vista previa de la imagen */}
        <img className="image-preview" src={imagePreview} alt="Vista previa" />
        <Button onClick={handleClick} variant="success">
          IMAGINE NOUA
        </Button>
      </div>
      {fileError && <Alert variant="danger">{fileError}</Alert>}
    </div>
  );
};

export default FileUploader;
