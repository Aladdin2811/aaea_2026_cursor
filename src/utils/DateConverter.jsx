const DateConverter = ({ dateString }) => {
  if (!dateString) {
    return ""; // Return empty string if dateString is null
  }

  const dateObj = new Date(dateString);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // Month is zero-based, so add 1
  const day = dateObj.getDate();

  const formattedDate = `${year}/${month < 10 ? "0" + month : month}/${
    day < 10 ? "0" + day : day
  }`;

  return formattedDate;
};

export default DateConverter;
