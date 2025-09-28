const log = (level, message) => {
  const logMessage = `[${level.toUpperCase()}] ${message}`;
  if (level.toUpperCase() === 'ERRO') {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
};

export default log;