import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Macto Ichiba",
  version: packageJson.version,
  copyright: `© ${currentYear}, Macto Ichiba.`,
  meta: {
    title: "Macto Ichiba - Starter Template",
    description: "Macto Ichiba is a modern dashboard.",
  },
};
