import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { addWetlandExhibits } from "./wetland-exhibits.mjs";

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
  MeshType,
  Model,
  NormalId,
  Part,
  PartType,
  RobloxFile,
  SpecialMesh,
  SpawnLocation,
  SurfaceGui,
  SurfaceGuiSizingMode,
  TextLabel,
  UDim,
  UDim2,
  Vector2,
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
  water: "#5a9ba6",
  ivory: "#f7f0de",
  gooseBrown: "#826749",
  bark: "#4c3b2d",
  feather: "#7a7972",
  silvery: "#b5b7ae",
  peach: "#d89b78",
  charcoal: "#302e2e",
  chestnut: "#684836",
  blueGrey: "#617d91",
  leafDark: "#3a5d37",
  leafGreen: "#507141",
  leafLight: "#789555",
  marshEarth: "#665641",
  seed: "#937b4c",
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
const exhibitDimensions = [];

function box(
  parent,
  name,
  position,
  size,
  fill,
  { collide = true, label, spawn = false, ellipsoid = false, angle = 0 } = {},
) {
  const part = spawn ? new SpawnLocation() : new Part();
  part.Parent = parent;
  part.Name = name;
  part.Size = vec(ellipsoid ? [1, 1, 1] : size);
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
  if (ellipsoid) {
    // Ball parts constrain their geometry; a sphere mesh supports independent axes.
    const mesh = new SpecialMesh();
    mesh.MeshType = MeshType.Sphere;
    mesh.Scale = vec(size);
    mesh.Parent = part;
    exhibitDimensions.push({ name, position, size });
  }
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
    gui.SizingMode = SurfaceGuiSizingMode.FixedSize;
    const width = Math.round(64 * size[0]);
    const height = Math.round(64 * size[1]);
    gui.CanvasSize = new Vector2(width, height);
    const text = new TextLabel();
    text.Parent = gui;
    text.Size = new UDim2(new UDim(1, 0), new UDim(1, 0));
    text.BackgroundTransparency = 1;
    text.TextScaled = false;
    text.TextSize = Math.floor(
      Math.min(height * 0.76, width / (label.length * 0.66)),
    );
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
  label: "IZUNUMA WETLAND GALLERY",
});
box(architecture, "Spawn", [0, 0.18, 27], [6, 0.36, 4], "mint", {
  spawn: true,
});
box(architecture, "Floor Guide", [0, 0.015, 11], [1.6, 0.03, 21], "mint", {
  collide: false,
});

const stations = [
  { x: -18, title: "01 Goose", sign: "01  WHITE-FRONTED GOOSE" },
  { x: 0, title: "02 Pintail", sign: "02  NORTHERN PINTAIL" },
  { x: 18, title: "03 Makomo", sign: "03  MAKOMO" },
];
for (const { x, title, sign } of stations) {
  box(exhibits, title, [x, 0.75, -15], [10, 1.5, 7], "wood");
  box(exhibits, `${title} Label`, [x, 0.8, -11.43], [9.2, 1.08, 0.14], "ink", {
    label: sign,
  });
  box(exhibits, `${title} Accent`, [x, 0.015, -8], [8, 0.03, 0.8], "water", {
    collide: false,
  });
}
addWetlandExhibits((index, name, position, size, fill, angle) => {
  const { x } = stations[index];
  const water = name.endsWith(" Water");
  box(
    exhibits,
    name,
    [x + position[0], 1.5 + position[1], -15 + position[2]],
    size,
    fill,
    {
      ellipsoid: !water,
      angle: ((angle ?? 0) * Math.PI) / 180,
      collide: false,
    },
  );
});

const boardSize = [10, 4, 0.7];
const boardBefore = [0, 2, 14];
const boardAfter = [15, 2, 14];
box(architecture, "Welcome Board", boardAfter, boardSize, "ink", {
  label: "IZUNUMA EXHIBITS 01-03",
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
  "IZUNUMA WETLAND GALLERY",
);
const savedParts = decoded.FindDescendants((node) => node.IsA("Part"));
const coordinates = ({ X, Y, Z }) => [X, Y, Z];
const approximately = (a, b) =>
  a.every((value, i) => Math.abs(value - b[i]) < 0.0001);
for (const { name, position, size } of exhibitDimensions) {
  const specimen = savedParts.find(
    (part) =>
      part.Name === name &&
      approximately(coordinates(part.CFrame.Position), position),
  );
  const mesh = specimen?.FindFirstChildOfClass("SpecialMesh");
  assert.ok(
    specimen?.Shape === PartType.Block &&
      mesh?.MeshType === MeshType.Sphere &&
      approximately(coordinates(specimen.Size), [1, 1, 1]) &&
      approximately(coordinates(mesh.Scale), size),
    `Exhibit dimension was not preserved: ${name}`,
  );
}
const savedLabels = decoded.FindDescendantsOfClass("TextLabel");
for (const { sign } of stations)
  assert.ok(
    savedLabels.some(
      (label) =>
        label.Text === sign &&
        label.TextSize >= 30 &&
        label.Parent.SizingMode === SurfaceGuiSizingMode.FixedSize,
    ),
  );
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
    const mesh = part.FindFirstChildOfClass("SpecialMesh");
    const size = coordinates(part.Size);
    return {
      name: part.Name,
      position: coordinates(part.CFrame.Position),
      size: mesh
        ? coordinates(mesh.Scale).map((scale, i) => scale * size[i])
        : size,
      color: `#${hex}`,
      collide: part.CanCollide,
      label: part
        .FindFirstChildOfClass("SurfaceGui")
        ?.FindFirstChildOfClass("TextLabel")?.Text,
      angle: Math.atan2(part.CFrame.Orientation[3], part.CFrame.Orientation[0]),
      ball: mesh?.MeshType === MeshType.Sphere,
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
