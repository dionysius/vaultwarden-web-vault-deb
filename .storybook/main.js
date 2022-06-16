module.exports = {
  stories: [
    "../libs/components/src/**/*.stories.mdx",
    "../libs/components/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "storybook-addon-designs",
  ],
  framework: "@storybook/angular",
  core: {
    builder: "webpack5",
  },
};
