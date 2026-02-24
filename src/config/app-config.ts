import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "TELKOMINFRA SULAWESI",
  version: packageJson.version,
  copyright: `© ${currentYear}, TELKOMINFRA SULAWESI.`,
  meta: {
    title: "TELKOMINFRA SULAWESI",
    description: "Development by Macto.",
  },
};
