export default [
  {
    files: ["build.mjs", "wetland-exhibits.mjs", "lz4-portable.cjs"],
    languageOptions: {
      globals: {
        URL: "readonly",
        console: "readonly",
        process: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
    rules: {
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-undef": "error",
      "no-unused-vars": "error",
    },
  },
];
