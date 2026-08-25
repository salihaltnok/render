module.exports = (command, outputPath) => {
  command
    .videoCodec("libx264")
    .audioCodec("aac")
    .toFormat("mp4")
    .save(outputPath);
};
