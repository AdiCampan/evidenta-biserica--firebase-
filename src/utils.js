export const calculateAge = (birthDate) => {
  if (!birthDate) {
    return "";
  }

  const dataNasteriiUnix = Math.floor(birthDate.toDate().getTime() / 1000);
  const dataCurentaUnix = Math.floor(new Date().getTime() / 1000);
  return Math.floor((dataCurentaUnix - dataNasteriiUnix) / 3600 / 24 / 365);
};

export const formatDate = (dateToFormat) => {
  if (!dateToFormat) {
    return "";
  }

  const date = dateToFormat.toDate();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const formatDateLong = (dateToFormat) => {
  if (!dateToFormat) {
    return "";
  }

  const date = dateToFormat.toDate();

  // Formatear la fecha con toLocaleDateString en español
  return date.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const searchAnyText = (field, searchText) => {
  if (searchText === "") {
    return false;
  }

  const result =
    field?.toString().length > 0 &&
    field
      .toString()
      .trim()
      .toLowerCase()
      .indexOf(searchText.trim().toLowerCase()) !== -1;
  return result;
};
export const searchField = (field, searchText) => {
  if (!searchText?.trim()) {
    return false; // Si no hay texto de búsqueda, no hay coincidencias
  }

  return field
    ?.toString()
    .trim()
    .toLowerCase()
    .startsWith(searchText.trim().toLowerCase());
};

export const filterByText = (members, field, searchText) => {
  return members.filter((member) => {
    if (searchText === "") {
      return true;
    } else if (searchField(member[field], searchText)) {
      return true;
    }
    return false;
  });
};
export const filterByAnyText = (members, field, searchText) => {
  return members.filter((member) => {
    if (searchText === "") {
      return true;
    } else if (searchAnyText(member[field], searchText)) {
      return true;
    }
    return false;
  });
};

export const filterByAgeGreater = (members, field, searchText) => {
  return members.filter((member) => {
    if (searchText === "") {
      return true;
    } else if (calculateAge(member[field]) >= parseInt(searchText)) {
      return true;
    }
    return false;
  });
};

export const filterByAge = (members, field, searchText) => {
  return members.filter((member) => {
    if (searchText === "") {
      return true;
    } else if (calculateAge(member[field]) === parseInt(searchText)) {
      return true;
    }
    return false;
  });
};
export const filterByAgeSmaller = (members, field, searchText) => {
  return members.filter((member) => {
    if (searchText === "") {
      return true;
    } else if (calculateAge(member[field]) <= parseInt(searchText)) {
      return true;
    }
    return false;
  });
};

export const filterByDate = (members, field, searchText) => {
  return members.filter((member) => {
    if (searchText === "") {
      return true;
    } else if (searchField(formatDate(member[field]))) {
      return false;
    }
  });
};

export const filterBySex = (members, value) => {
  return members.filter((member) => {
    if (value === "") {
      // M + F
      return true;
    } else if (
      (member.sex && value === "M") ||
      (!member.sex && value === "F")
    ) {
      return true;
    }
    return false;
  });
};
