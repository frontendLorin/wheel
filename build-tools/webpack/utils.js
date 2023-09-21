const getAbsPath = (path) => {
  if (path.startsWith('./')) {
    return path.join(pwd, config.entry);
  }

  return path;
};

module.exports = {
  getAbsPath
};
