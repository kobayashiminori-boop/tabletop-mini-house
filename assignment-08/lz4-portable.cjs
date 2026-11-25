const binding = require("lz4/lib/binding.js");

function encodeBlock(input, output) {
  const size = binding.compress(input, output);
  if (size > 0) return size;
  let offset = 0;
  output[offset++] = Math.min(15, input.length) << 4;
  if (input.length >= 15) {
    let remaining = input.length - 15;
    while (remaining >= 255) {
      output[offset++] = 255;
      remaining -= 255;
    }
    output[offset++] = remaining;
  }
  input.copy(output, offset);
  return offset + input.length;
}

module.exports = {
  encodeBound: binding.compressBound,
  encodeBlock,
  decodeBlock: binding.uncompress,
};
