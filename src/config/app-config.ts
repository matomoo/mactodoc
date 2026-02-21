import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "TELKOM INFRA SULAWESI",
  version: packageJson.version,
  copyright: `© ${currentYear}, TELKOM INFRA SULAWESI.`,
  meta: {
    title: "TELKOM INFRA SULAWESI",
    description: "Development by Macto.",
  },
};
