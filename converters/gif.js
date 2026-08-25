module.exports = (command, outputPath) => {
  command.fps(10).size("320x?").toFormat("gif").save(outputPath);
};
