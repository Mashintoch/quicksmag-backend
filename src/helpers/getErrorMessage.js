const getErrorMessage = (err, defaultMessage) => {
    if (err instanceof Error) return err.message;
    return defaultMessage ?? "An error occured!";
  };
  
  export default getErrorMessage;
  