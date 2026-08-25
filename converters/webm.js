module.exports = (command, outputPath) => {
  command
    .videoCodec("libvpx-vp9")
    .audioCodec("libopus")
    .toFormat("webm")
    .save(outputPath);
};
