module.exports = (command, outputPath) => {
  command.setDuration(10).toFormat("mp4").save(outputPath);
};
