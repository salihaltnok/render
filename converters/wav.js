module.exports = (command, outputPath) => {
  command.toFormat("wav").save(outputPath);
};
