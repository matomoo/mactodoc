import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Ichiba Medical",
  version: packageJson.version,
  copyright: `© ${currentYear}, Ichiba Medical.`,
  meta: {
    title: "Ichiba Medical",
    description: "Development by Macto.",
  },
};
