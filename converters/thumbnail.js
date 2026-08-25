module.exports = (command, outputPath) => {
  command
    .frames(1)
    .seekInput("00:00:02")
    .toFormat("image2")
    .save(outputPath.replace(/\.[^/.]+$/, ".jpg"));
};
