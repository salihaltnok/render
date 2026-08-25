module.exports = (command, outputPath) => {
  command.noAudio().toFormat("mp4").save(outputPath);
};
