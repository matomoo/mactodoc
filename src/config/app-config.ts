import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "MACTODOC",
  version: packageJson.version,
  copyright: `© ${currentYear}, MACTODOC APPS.`,
  meta: {
    title: "MACTODOC APPS",
    description: "Development by Macto.",
  },
};
