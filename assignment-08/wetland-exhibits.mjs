const birds = [
  {
    name: "White-fronted Goose",
    pieces: [
      ["Body", [0.35, 1.65, 0], [4.25, 2.1, 2.35], "gooseBrown"],
      ["Back", [0.6, 2.03, 0], [3.5, 1.18, 2.02], "bark"],
      ["Wing", [0.7, 1.8, 0.89], [3.1, 1.07, 0.75], "feather"],
      ["Tail", [2.3, 1.96, 0], [1.1, 0.55, 1.2], "bark", -8],
      ["Neck", [-1.4, 2.77, 0], [0.97, 2.29, 1.04], "gooseBrown", 24],
      ["Head", [-1.97, 3.84, 0], [1.27, 1.02, 1.03], "gooseBrown"],
      ["White Front", [-2.43, 3.92, 0], [0.42, 0.68, 0.86], "ivory", -12],
      ["Bill", [-2.89, 3.78, 0], [0.8, 0.3, 0.59], "peach"],
      ["Eye", [-2.08, 4.0, 0.47], [0.15, 0.15, 0.11], "charcoal"],
      ["Belly Mark", [-0.63, 1.13, 1.01], [0.66, 0.27, 0.16], "charcoal", -13],
      ["Belly Mark", [0.16, 1.08, 1.06], [0.72, 0.3, 0.16], "charcoal", 6],
      ["Foot", [-0.46, 0.55, 0.58], [0.83, 0.23, 0.49], "peach"],
      ["Foot", [0.51, 0.55, -0.27], [0.83, 0.23, 0.49], "peach"],
    ],
  },
  {
    name: "Northern Pintail",
    pieces: [
      ["Body", [0.15, 1.26, 0], [3.83, 1.54, 2.08], "silvery"],
      ["Chest", [-0.96, 1.7, 0.1], [1.58, 1.7, 1.66], "ivory", 19],
      ["Wing", [0.45, 1.57, 0.83], [2.6, 0.91, 0.72], "feather"],
      ["Wing Edge", [0.87, 1.46, 1.14], [1.58, 0.29, 0.32], "charcoal", 8],
      ["Neck", [-1.29, 2.28, 0], [0.72, 1.7, 0.83], "ivory", 22],
      ["Nape", [-1.29, 2.58, 0], [0.35, 1.26, 0.7], "chestnut", 26],
      ["Head", [-1.77, 3.06, 0], [1.19, 0.88, 0.89], "chestnut"],
      ["Bill", [-2.62, 2.95, 0], [0.88, 0.25, 0.49], "blueGrey"],
      ["Eye", [-1.88, 3.19, 0.4], [0.14, 0.14, 0.11], "charcoal"],
      ["Pointed Tail", [2.1, 1.57, 0], [1.67, 0.35, 0.6], "charcoal", 23],
      ["Pointed Tail Tip", [2.89, 1.89, 0], [1.3, 0.16, 0.29], "charcoal", 25],
    ],
  },
];

export function addWetlandExhibits(add) {
  for (const [index, { name, pieces }] of birds.entries()) {
    add(index, `${name} Water`, [0, 0.16, 0], [9.15, 0.32, 5.3], "water");
    for (const [part, position, size, color, angle = 0] of pieces) {
      add(index, `${name} ${part}`, position, size, color, angle);
    }
  }

  const rice = 2;
  add(rice, "Makomo Water", [0, 0.14, 0], [9.15, 0.28, 5.3], "water");
  for (const [index, x] of [-2.7, -1.35, 0, 1.25, 2.45].entries()) {
    const z = index % 2 ? -0.8 : 0.5;
    add(rice, "Makomo Root", [x, 0.3, z], [1.15, 0.48, 1.35], "marshEarth", 0);
    for (const [spread, height, slope, color] of [
      [-0.55, 3.25, 24, "leafDark"],
      [-0.18, 4.0, 8, "leafLight"],
      [0.23, 3.6, -12, "leafGreen"],
      [0.67, 3.05, -31, "leafLight"],
    ]) {
      const addedHeight = (2 - Math.abs(index - 2)) * 0.37;
      add(
        rice,
        "Makomo Leaf",
        [x + spread, height / 2 + addedHeight / 2, z],
        [0.38, height + addedHeight, 0.18],
        color,
        slope,
      );
    }
    if (index % 2) {
      add(
        rice,
        "Makomo Stem",
        [x + 0.15, 2.48, z],
        [0.15, 4.9, 0.15],
        "leafDark",
        -4,
      );
      for (const [level, spread] of [
        [4.35, 0.43],
        [4.61, 0.31],
        [4.84, 0.21],
      ]) {
        for (const side of [-1, 1]) {
          add(
            rice,
            "Makomo Panicle Branch",
            [x + 0.31 + (side * spread) / 2, level, z],
            [0.085, spread + 0.13, 0.075],
            "seed",
            -side * 55,
          );
          add(
            rice,
            "Makomo Spikelet",
            [x + 0.31 + side * spread, level + 0.11, z],
            [0.095, 0.24, 0.085],
            "seed",
            -side * 39,
          );
        }
      }
    }
  }
}
