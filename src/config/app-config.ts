import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "HUB",
  version: packageJson.version,
  copyright: `© ${currentYear}, HUB.`,
  meta: {
    title: "HUB",
    description: "Development by Macto.",
  },
};
