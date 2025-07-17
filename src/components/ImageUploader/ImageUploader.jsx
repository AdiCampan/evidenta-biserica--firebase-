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
  isExternalForm = false, // Nuevo prop para identificar formularios externos
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

  // Función para comprimir imagen
  const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con compresión
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadWithRetry = async (fileRef, currentFile, storagePath, retries = 3) => {
    try {
      console.log(`Procesando archivo localmente: ${currentFile.name}`);
      
      // Comprimir la imagen antes de convertir a base64
      const compressedBase64 = await compressImage(currentFile);
      
      // Verificar el tamaño del base64 (aproximadamente)
      const base64Size = (compressedBase64.length * 3) / 4; // Tamaño aproximado en bytes
      console.log(`Tamaño de imagen comprimida: ${Math.round(base64Size / 1024)} KB`);
      
      if (base64Size > 900000) { // 900KB como límite de seguridad
        // Si aún es muy grande, comprimir más
        const extraCompressed = await compressImage(currentFile, 200, 200, 0.5);
        console.log('Aplicando compresión adicional');
        onFileSelectSuccess(extraCompressed);
        setImagePreview(extraCompressed);
      } else {
        onFileSelectSuccess(compressedBase64);
        setImagePreview(compressedBase64);
      }
      
      console.log('Imagen procesada y comprimida exitosamente');
      
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      setFileError(`Error al procesar la imagen: ${error.message}`);
      onFileSelectError({ error });
    }
  };

  const handleSelectFile = () => {
    setFileError(null);

    if (fileInputRef.current?.files) {
      const currentFile = fileInputRef.current.files[0];
      const extension = currentFile.name.split(".").pop().toLowerCase();

      if (ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
        setFileError(
          "Se pueden cargar solo imágenes con extensión .jpg, .jpeg y .png"
        );
        onFileSelectError(true);
      } else if (currentFile.size > 10_000_000) {
        setFileError("Se pueden cargar solo imágenes de máximo 10MB");
        onFileSelectError(true);
      } else {
        // Usar ruta diferente para formularios externos
        const storagePath = isExternalForm 
          ? `externalForms/${id}/${currentFile.name}` 
          : id;
        
        const fileRef = ref(storage, storagePath);
        uploadWithRetry(fileRef, currentFile, storagePath);
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
