module.exports = (command, outputPath) => {
  command.toFormat("mp3").save(outputPath);
};
