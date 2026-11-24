const VideoStream = require('videostream');
const { Readable } = require('readable-stream');

// Fetch the next range only when the MP4 demuxer asks for more bytes.
module.exports = function openEpisode(file, video, onError) {
  const active = new Set();
  const player = new VideoStream({
    createReadStream({ start = 0, end = file.size - 1 }) {
      let offset = start;
      const stream = new Readable({
        async read() {
          if (offset > end) return this.push(null);
          const last = Math.min(end, offset + 2 * 1024 * 1024 - 1);
          try {
            const data = await file.downloadBuffer({ start: offset, end: Math.max(1, last), forceHttps: true });
            if (this.destroyed) return;
            const length = last - offset + 1;
            if (data.length < length) throw Error('Transferência incompleta');
            offset = last + 1;
            this.push(data.subarray(0, length));
          } catch (error) { this.destroy(error); }
        }
      });
      active.add(stream);
      stream.on('error', onError);
      stream.once('close', () => active.delete(stream));
      stream.once('end', () => active.delete(stream));
      return stream;
    }
  }, video);
  return () => {
    for (const stream of active) stream.destroy();
    player.destroy();
  };
};
