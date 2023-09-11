module.exports = {
  // ...
  presets: [require("@mantle/tailwind-config")],

  // Project-specific customizations
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 3s linear infinite",
      },
    },
  },
};

// const config = require('@mantle/tailwind-config')

// module.exports = config
