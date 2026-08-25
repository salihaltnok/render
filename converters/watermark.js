const path = require("path");

module.exports = (command, outputPath) => {
  // Font dosyasının tam yolunu projenin ana dizininden alıyoruz
  const fontPath = path.join(__dirname, "..", "font.ttf");

  command
    .videoFilters(
      `drawtext=fontfile='${fontPath}':text='Portfolyo':fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=w-tw-10:y=h-th-10`,
    )
    .toFormat("mp4")
    .save(outputPath);
};
