import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "PT. Ichiba Medical indonesia",
  version: packageJson.version,
  copyright: `© ${currentYear}, PT. Ichiba Medical indonesia.`,
  meta: {
    title: "PT. Ichiba Medical indonesia",
    description: "Development by Macto.",
  },
};
