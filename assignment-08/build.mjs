import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { registerHooks } from "node:module";

const portableLz4 = new URL("./lz4-portable.cjs", import.meta.url).href;
const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === "lz4" ? portableLz4 : specifier, context);
  },
});
const {
  Camera,
  CFrame,
  Color3,
  Lighting,
  Material,
  Model,
  NormalId,
  Part,
  PartType,
  RobloxFile,
  SpawnLocation,
  SurfaceGui,
  TextLabel,
  UDim,
  UDim2,
  Vector3,
  Workspace,
} = await import("rbxm-parser");
hook.deregister();

const palette = {
  ink: "#17353b",
  ground: "#a9b9a5",
  floor: "#dfd0b5",
  wall: "#e6e8d9",
  wood: "#b78056",
  mint: "#479a87",
  blue: "#438aa4",
  deepWater: "#14587c",
  turquoise: "#18a9c0",
  foam: "#eefcff",
  coral: "#c86f51",
  cream: "#f1ddb3",
};

const color = (value) =>
  Color3.FromRGB(
    ...value
      .slice(1)
      .match(/../g)
      .map((channel) => parseInt(channel, 16)),
  );
const vec = (value) => new Vector3(...value);
const identity = CFrame.Identity.Orientation;
const output = new URL("./waterfront-gallery.rbxl", import.meta.url);
const file = new RobloxFile();
const workspace = new Workspace();
const lighting = new Lighting();
file.AddRoot(workspace);
file.AddRoot(lighting);
lighting.ClockTime = 14;
lighting.Brightness = 2;
lighting.Ambient = color("#8797a0");
lighting.OutdoorAmbient = color("#b5bec5");

function group(name) {
  const model = new Model();
  model.Name = name;
  model.Parent = workspace;
  return model;
}

const architecture = group("Gallery");
const exchange = group("Conversation Corner");
const exhibits = group("Three Exhibits");

function box(
  parent,
  name,
  position,
  size,
  fill,
  { collide = true, label, spawn = false, shape, angle = 0 } = {},
) {
  const part = spawn ? new SpawnLocation() : new Part();
  part.Parent = parent;
  part.Name = name;
  part.Size = vec(size);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  part.CFrame = new CFrame(
    vec(position),
    angle ? [cos, -sin, 0, sin, cos, 0, 0, 0, 1] : identity,
  );
  part.Anchored = true;
  part.CanCollide = collide;
  part.Color3uint8 = color(palette[fill]);
  part.Material = Material.SmoothPlastic;
  if (shape) part.Shape = shape;
  if (spawn) {
    part.Neutral = true;
    part.Duration = 0;
  }
  if (label) {
    const gui = new SurfaceGui();
    gui.Parent = part;
    gui.Face = NormalId.Back;
    gui.LightInfluence = 0;
    gui.MaxDistance = 65;
    const text = new TextLabel();
    text.Parent = gui;
    text.Size = new UDim2(new UDim(1, 0), new UDim(1, 0));
    text.BackgroundTransparency = 1;
    text.TextScaled = true;
    text.TextColor3 = color("#ffffff");
    text.Text = label;
  }
  return part;
}

box(architecture, "Courtyard", [0, -1, 0], [90, 1, 80], "ground");
box(architecture, "Gallery Floor", [0, -0.25, 0], [64, 0.5, 56], "floor");
box(architecture, "Left Wall", [-31.5, 4.5, 0], [1, 9, 54], "wall");
box(architecture, "Right Wall", [31.5, 4.5, 0], [1, 9, 54], "wall");
box(architecture, "Rear Wall", [0, 4.5, -26.5], [64, 9, 1], "wall");
for (const direction of [-1, 1]) {
  box(
    architecture,
    "Front Wing",
    [19.5 * direction, 2.5, 22],
    [25, 5, 1],
    "wall",
  );
  box(
    architecture,
    "Entrance Post",
    [7.5 * direction, 4, 22],
    [1, 8, 1.2],
    "mint",
  );
}
box(architecture, "Entrance Sign", [0, 8, 22], [16, 2.4, 1.3], "ink", {
  label: "WATERFRONT GALLERY",
});
box(architecture, "Spawn", [0, 0.18, 27], [6, 0.36, 4], "mint", {
  spawn: true,
});
box(architecture, "Floor Guide", [0, 0.015, 11], [1.6, 0.03, 21], "mint", {
  collide: false,
});

const stations = [
  { x: -18, name: "01  WAVE", tone: "blue" },
  { x: 0, name: "02  LIGHTHOUSE", tone: "coral" },
  { x: 18, name: "03  BRIDGE", tone: "mint" },
];
for (const { x, name, tone } of stations) {
  box(exhibits, name, [x, 0.75, -15], [10, 1.5, 7], "wood");
  box(exhibits, `${name} Label`, [x, 0.8, -11.43], [8.6, 1.08, 0.14], "ink", {
    label: name,
  });
  box(exhibits, `${name} Accent`, [x, 0.015, -8], [8, 0.03, 0.8], tone, {
    collide: false,
  });
}
const wave = new Model();
wave.Name = "Breaking Wave";
wave.Parent = exhibits;
const waveOrigin = [-18, 1.5, -15];
const swell = [
  [-4.05, 0.65],
  [-2.7, 1.15],
  [-1.55, 2.15],
  [-0.6, 3.6],
  [0.65, 4.95],
  [2.15, 5.7],
  [3.5, 5.5],
  [4.0, 4.52],
  [3.1, 3.8],
];
const wavePosition = (x, y, z = 0) =>
  waveOrigin.map((origin, i) => origin + [x, y, z][i]);
box(wave, "Water Base", wavePosition(0, 0.22), [9.5, 0.44, 5.3], "deepWater");
box(
  wave,
  "Wave Foot",
  wavePosition(-2.4, 0.78),
  [4.6, 1.55, 3.65],
  "deepWater",
  {
    shape: PartType.Ball,
  },
);
for (const [index, [x, y]] of swell.entries()) {
  const tone = index < 4 ? "deepWater" : "turquoise";
  box(wave, `Swell ${index + 1}`, wavePosition(x, y), [1.8, 1.8, 3.1], tone, {
    shape: PartType.Ball,
  });
  if (index === 0) continue;
  const [previousX, previousY] = swell[index - 1];
  const dx = x - previousX;
  const dy = y - previousY;
  box(
    wave,
    `Curve ${index}`,
    wavePosition(x - dx / 2, y - dy / 2),
    [Math.hypot(dx, dy) + 1.35, 1.65, 3.08],
    tone,
    {
      shape: PartType.Ball,
      angle: Math.atan2(dy, dx),
    },
  );
}
for (const [index, [x, y, z, diameter]] of [
  [0.6, 5.8, 0.55, 0.8],
  [1.5, 6.35, 0.55, 1.04],
  [2.52, 6.48, 0.58, 1.12],
  [3.62, 6.27, 0.6, 1.05],
  [4.28, 5.68, 0.65, 0.83],
  [4.35, 4.95, 0.78, 0.7],
  [4.67, 4.35, 0.93, 0.43],
  [3.86, 3.8, 1.07, 0.46],
  [4.52, 3.53, 1.18, 0.25],
].entries()) {
  box(
    wave,
    `Whitecap ${index + 1}`,
    wavePosition(x, y, z),
    [diameter, diameter, diameter * 1.65],
    "foam",
    {
      shape: PartType.Ball,
      collide: false,
    },
  );
}
for (const [y, width, height, tone] of [
  [2.5, 3, 2, "cream"],
  [4.4, 2.6, 1.8, "coral"],
  [6, 2.1, 1.4, "cream"],
  [7.05, 2.8, 0.7, "ink"],
]) {
  box(
    exhibits,
    "Lighthouse Segment",
    [0, y, -15],
    [width, height, width],
    tone,
  );
}
for (const side of [-1, 1]) {
  box(
    exhibits,
    "Bridge Pier",
    [18 + side * 2.7, 2.85, -15],
    [1.05, 2.7, 2],
    "mint",
  );
}
box(exhibits, "Bridge Deck", [18, 4.5, -15], [8, 0.6, 2.6], "mint");
for (const z of [-16.1, -13.9]) {
  box(exhibits, "Bridge Rail", [18, 5.15, z], [8, 0.25, 0.18], "ink");
}

const boardSize = [10, 4, 0.7];
const boardBefore = [0, 2, 14];
const boardAfter = [15, 2, 14];
box(architecture, "Welcome Board", boardAfter, boardSize, "ink", {
  label: "EXHIBITS 01-03",
});
box(exchange, "Meeting Area", [20, 0.025, 4], [17, 0.05, 13], "cream", {
  collide: false,
});
box(exchange, "Discussion Table", [20, 1.1, 4], [5, 2.2, 3], "wood");
for (const x of [14, 26]) {
  box(exchange, "Bench", [x, 0.8, 4], [1.8, 1.6, 6], "mint");
}
box(exchange, "Meeting Sign", [30.8, 5.5, 9], [0.3, 2, 10], "mint");

const camera = new Camera();
camera.Parent = workspace;
camera.Name = "Camera";
camera.CFrame = new CFrame(
  vec([0, 26, 49]),
  [1, 0, 0, 0, 0.866, 0.5, 0, -0.5, 0.866],
);
workspace.CurrentCamera = camera;

const encoded = file.WriteToBuffer();
const decoded = RobloxFile.ReadFromBuffer(encoded);
assert.ok(decoded);
assert.equal(
  decoded.FindFirstDescendantOfClass("Workspace").FindChildrenOfClass("Model")
    .length,
  3,
);
assert.equal(
  decoded.FindFirstDescendantOfClass("SpawnLocation").Anchored,
  true,
);
assert.equal(decoded.FindChildrenOfClass("Lighting").length, 1);
assert.equal(
  decoded.FindFirstDescendantOfClass("TextLabel").Text,
  "WATERFRONT GALLERY",
);
const savedWave = decoded
  .FindFirstDescendantOfClass("Workspace")
  .FindChildrenOfClass("Model")
  .find((model) => model.Name === "Three Exhibits")
  .FindFirstDescendantOfClass("Model");
assert.equal(savedWave.Name, "Breaking Wave");
const savedWhitecaps = savedWave
  .FindChildrenOfClass("Part")
  .filter((part) => part.Name.startsWith("Whitecap"));
assert.equal(savedWhitecaps.length, 9);
assert.ok(
  savedWhitecaps.every(
    (part) => part.Shape === PartType.Ball && part.Color3uint8.R > 0.9,
  ),
);
const coordinates = ({ X, Y, Z }) => [X, Y, Z];
const parts = decoded
  .FindDescendants((node) => node.IsA("Part"))
  .map((part) => {
    const { R, G, B } = part.Color3uint8;
    const hex = [R, G, B]
      .map((value) =>
        Math.round(value * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
    return {
      name: part.Name,
      position: coordinates(part.CFrame.Position),
      size: coordinates(part.Size),
      color: `#${hex}`,
      collide: part.CanCollide,
      label: part
        .FindFirstChildOfClass("SurfaceGui")
        ?.FindFirstChildOfClass("TextLabel")?.Text,
      angle: Math.atan2(part.CFrame.Orientation[3], part.CFrame.Orientation[0]),
      ball: part.Shape === PartType.Ball,
    };
  });

function entranceWidth(position) {
  const entrance = [-7, 7];
  const board = [
    position[0] - boardSize[0] / 2,
    position[0] + boardSize[0] / 2,
  ];
  if (board[0] >= entrance[1] || board[1] <= entrance[0]) return 14;
  return Math.max(0, board[0] - entrance[0], entrance[1] - board[1]);
}

const widths = [entranceWidth(boardBefore), entranceWidth(boardAfter)];
assert.deepEqual(widths, [2, 14]);
const blockers = parts.filter(
  ({ collide, position, size }) =>
    collide && position[1] + size[1] / 2 > 0.5 && position[1] - size[1] / 2 < 5,
);
const clear = (x, z) =>
  !blockers.some(
    ({ position: [px, , pz], size: [w, , d] }) =>
      Math.abs(px - x) <= w / 2 + 0.75 && Math.abs(pz - z) <= d / 2 + 0.75,
  );
const start = [0, 27];
const queue = [start];
const visited = new Set([start.join(",")]);
for (let index = 0; index < queue.length; index++) {
  const [x, z] = queue[index];
  for (const [dx, dz] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]) {
    const next = [x + dx, z + dz];
    const key = next.join(",");
    if (
      Math.abs(next[0]) >= 31 ||
      next[1] <= -26 ||
      next[1] > 28 ||
      visited.has(key) ||
      !clear(...next)
    )
      continue;
    visited.add(key);
    queue.push(next);
  }
}
const targets = [...stations.map(({ x }) => [x, -8]), [20, 8]];
for (const point of targets)
  assert.ok(visited.has(point.join(",")), `Unreachable: ${point}`);

writeFileSync(output, encoded);
if (process.argv[2]) {
  writeFileSync(
    process.argv[2],
    JSON.stringify({ parts, boardBefore, boardAfter, widths, start, targets }),
  );
}
console.log(
  "RBXL round-trip passed. All four destinations reachable. Entrance route: 2 → 14 studs.",
);
