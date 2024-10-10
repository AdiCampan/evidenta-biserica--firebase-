import React, { useEffect, useRef, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase-config";
import { useParams } from "react-router";
import "./ImageUploader.scss";

const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png"];
const EMPTY_IMAGE = "/src/assets/images/person-placeholder.jpg";

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
  onFileSelectSuccess,
  onFileSelectError,
  initialImage, // La cadena en hexadecimal de la imagen original
}) => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(EMPTY_IMAGE); // Vista previa de la imagen
  const [fileError, setFileError] = useState(null);
  const { id } = useParams();
  const storageRef = ref(storage, `${id}`);

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
        // Sube la imagen al almacenamiento de Firebase
        uploadBytes(storageRef, currentFile).then((snapshot) => {
          getDownloadURL(ref(storage, `${id}`))
            .then((url) => {
              onFileSelectSuccess(url); // Devuelve la URL de descarga a través del callback
              setImagePreview(url); // Actualiza la vista previa con la URL obtenida de Firebase Storage
            })
            .catch((error) => {
              console.error("Error al obtener la URL de descarga:", error);
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

// import React, { useEffect, useRef, useState } from "react";
// import { Alert, Button, Form, InputGroup } from "react-bootstrap";
// import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
// import { storage } from "../../firebase-config";

// import "./ImageUploader.scss";
// import { useParams } from "react-router";

// const ALLOWED_EXTENSIONS = ["jpeg", "jpg", "png"];
// const EMPTY_IMAGE = "/src/assets/images/person-placeholder.jpg";

// const FileUploader = ({
//   onFileSelectSuccess,
//   onFileSelectError,
//   initialImage,
// }) => {
//   const fileInputRef = useRef(null);
//   const [imagePreview, setImagePreview] = useState(EMPTY_IMAGE); // small image as placeholder
//   const [fileError, setFileError] = useState(null);

//   const { id } = useParams();
//   const storageRef = ref(storage, `${id}`);

//   useEffect(() => {
//     setImagePreview(initialImage || EMPTY_IMAGE);
//   }, [initialImage]);

//   const handleClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleSelectFile = () => {
//     // reset error message
//     setFileError(null);

//     // check if we have files selected
//     if (fileInputRef.current?.files) {
//       const currentFile = fileInputRef.current.files[0];

//       // check extension
//       const extension = currentFile.name.split(".").pop();
//       if (ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
//         setFileError(
//           "Se pot incarca doar imagini cu extensia .jpg, .jpeg si .png"
//         );
//         onFileSelectError(true);
//         // check file size
//       } else if (currentFile.size > 10_000_000) {
//         // 1 000 - 1kb, 1 000 000 - 1mb
//         setFileError("Se pot incarca doar imagini de maxim 10MB");
//         onFileSelectError(true);
//         // all good, we can upload the file
//       } else {
//         uploadBytes(storageRef, currentFile).then((snapshot) => {
//           getDownloadURL(ref(storage, `${id}`))
//             .then((url) => {
//               onFileSelectSuccess(url);
//             })
//             .catch((error) => {
//               // Handle any errors
//             });
//           setImagePreview(URL.createObjectURL(currentFile));
//         });
//         // setImagePreview(URL.createObjectURL(currentFile));
//       }
//     }
//   };

//   return (
//     <div className="file-uploader-wrapper">
//       <div className="file-uploader">
//         <input
//           ref={fileInputRef}
//           onChange={handleSelectFile}
//           id="input-file"
//           className="d-none"
//           type="file"
//         />
//         <img className="image-preview" src={imagePreview} />
//         <Button onClick={handleClick} variant="success">
//           Incarca Poza
//         </Button>
//       </div>
//       {fileError && <Alert variant="danger">{fileError}</Alert>}
//     </div>
//   );
// };

// export default FileUploader;
