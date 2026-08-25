module.exports = (command, outputPath) => {
  command
    .videoFilters(
      "drawtext=text='Portfolyo':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=w-tw-10:y=h-th-10",
    )
    .toFormat("mp4")
    .save(outputPath);
};
