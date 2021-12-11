export const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getDateString = () => {
  const dateObj = new Date();
  const dateStr = new Date(
    dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];
  return dateStr;
};

export const handleAuthDataError = (obj) => {
  const error = new Error(obj.message);
  error.name = "authError";
  throw error;
};
