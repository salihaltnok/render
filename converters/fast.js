module.exports = (command, outputPath) => {
  command
    .videoFilters("setpts=0.5*PTS")
    .audioFilters("atempo=2.0")
    .toFormat("mp4")
    .save(outputPath);
};
