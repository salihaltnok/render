module.exports = (command, outputPath) => {
  command
    .size("1280x720")
    .videoCodec("libx264")
    .toFormat("mp4")
    .save(outputPath);
};
