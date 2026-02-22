// biome-ignore assist/source/organizeImports: <will fix later>
import type { Data2G4GModel } from "@/types/schema";
import type { UnifiedMetricConfig } from "./comparison-types";
import { toZonedTime } from "date-fns-tz";
import { endOfDay, startOfDay } from "date-fns";

// 2G specific metric configurations
export const get2G4GMetricConfigs = (): UnifiedMetricConfig[] => [
  {
    title: "TCH Traffic (Erl)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TCH_TRAFFIC_ERL || 0), 0),
    growthType: "successRate100",
    id: "TCH_TRAFFIC_ERL",
    metric_num: "TCH_TRAFFIC_ERL",
  },
  {
    title: "SDCCH Traffic (Erl)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.SDCCH_TRAFFIC_ERL || 0), 0),
    id: "SDCCH_TRAFFIC_ERL",
    metric_num: "SDCCH_TRAFFIC_ERL",
  },
  {
    title: "Total Payload (MB)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TOTAL_PAYLOAD_MB || 0), 0),
    id: "TOTAL_PAYLOAD_MB",
    metric_num: "TOTAL_PAYLOAD_MB",
  },
  {
    title: "Payload EDGE (MB)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.EDGE_PAYLOAD_MB || 0), 0),
    id: "EDGE_PAYLOAD_MB",
    metric_num: "EDGE_PAYLOAD_MB",
  },
  {
    title: "Payload GPRS (MB)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.GPRS_PAYLOAD_MB || 0), 0),
    id: "GPRS_PAYLOAD_MB",
    metric_num: "GPRS_PAYLOAD_MB",
  },
  {
    title: "SDSR (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_SDSR || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_SDSR || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate100",
    id: "NUM_SDSR",
    metric_num: "NUM_SDSR",
    metric_denum: "DENUM_SDSR",
  },
  {
    title: "SDCCH Block (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_SD_BLOCK || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_SD_BLOCK || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate0",
    id: "NUM_SD_BLOCK",
    metric_num: "NUM_SD_BLOCK",
    metric_denum: "DENUM_SD_BLOCK",
  },
  {
    title: "TCH Block (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_TCH_BLOCK || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_TCH_BLOCK || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate0",
    id: "NUM_TCH_BLOCK",
    metric_num: "NUM_TCH_BLOCK",
    metric_denum: "DENUM_TCH_BLOCK",
  },

  {
    title: "SDCCH Drop Rate (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_SDCCH_DROP || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_SDCCH_DROP || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate0",
    id: "NUM_SDCCH_DROP",
    metric_num: "NUM_SDCCH_DROP",
  },
  {
    title: "TBF DL Establish (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_TBF_DL_EST || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_TBF_DL_EST || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? 100 - Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate100",
    id: "NUM_TBF_DL_EST",
    metric_num: "NUM_TBF_DL_EST",
    metric_denum: "DENUM_TBF_DL_EST",
  },
  {
    title: "TBF UL Establish (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_TBF_UL_EST || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_TBF_UL_EST || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? 100 - Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_TBF_UL_EST",
    metric_num: "NUM_TBF_UL_EST",
    metric_denum: "DENUM_TBF_UL_EST",
  },
  {
    title: "TCH Drop (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_TCH_DROP || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_TCH_DROP || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_TCH_DROP",
    metric_num: "NUM_TCH_DROP",
    metric_denum: "DENUM_TCH_DROP",
  },
  {
    title: "TBF Completion SR (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_TBF_COMP || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_TBF_COMP || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_TBF_COMP",
    metric_num: "NUM_TBF_COMP",
    metric_denum: "DENUM_TBF_COMP",
  },
  {
    title: "EDGE DL Throughput (Kbps)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.EDGE_THP_KB || 0), 0),
    id: "EDGE_THP_KB",
    metric_num: "EDGE_THP_KB",
  },
  {
    title: "GPRS DL Throughput (kbps)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.GPRS_THP_KB || 0), 0),
    id: "GPRS_THP_KB",
    metric_num: "GPRS_THP_KB",
  },
  {
    title: "HOSR (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_HOSR || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_HOSR || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_HOSR",
    metric_num: "NUM_HOSR",
    metric_denum: "DENUM_HOSR",
  },
  {
    title: "TCH Availability (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_TCH_AVAIL || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_TCH_AVAIL || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_TCH_AVAIL",
    metric_num: "NUM_TCH_AVAIL",
    metric_denum: "DENUM_TCH_AVAIL",
  },
  {
    title: "SDCCH Availability (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_SDCCH_AVAIL || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_SDCCH_AVAIL || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_SDCCH_AVAIL",
    metric_num: "NUM_SDCCH_AVAIL",
    metric_denum: "DENUM_SDCCH_AVAIL",
  },
  {
    title: "DL_RX_Qual_0_5",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_DL_QUAL_05 || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_DL_QUAL_05 || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_DL_QUAL_05",
    metric_num: "NUM_DL_QUAL_05",
    metric_denum: "DENUM_DL_QUAL_05",
  },
  {
    title: "UL_RX_Qual_0_5",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_UL_QUAL_05 || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_UL_QUAL_05 || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_UL_QUAL_05",
    metric_num: "NUM_UL_QUAL_05",
    metric_denum: "DENUM_UL_QUAL_05",
  },
  {
    title: "IB Band 1-3",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_IB_BAND_1_3 || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_IB_BAND_1_3 || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_IB_BAND_1_3",
    metric_num: "NUM_IB_BAND_1_3",
    metric_denum: "DENUM_IB_BAND_1_3",
  },
  {
    title: "IB Band 4-5",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_IB_BAND_4_5 || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_IB_BAND_4_5 || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? 100 - Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_IB_BAND_4_5",
    metric_num: "NUM_IB_BAND_4_5",
    metric_denum: "DENUM_IB_BAND_4_5",
  },
  {
    title: "PDTCH Congestion (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.NUM_PDTCH_CONGESTION || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.DENUM_PDTCH_CONGESTION || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "NUM_PDTCH_CONGESTION",
    metric_num: "NUM_PDTCH_CONGESTION",
    metric_denum: "DENUM_PDTCH_CONGESTION",
  },
  //// metric 4G
  {
    title: "Total Payload (GB)",
    tech: "4G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TOTAL_PAYLOAD_GB || 0), 0),
    id: "TOTAL_PAYLOAD_GB",
    metric_num: "TOTAL_PAYLOAD_GB",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Traffic VoLTE (KErl)",
    tech: "4G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TRAFFIC_VOLTE_KERL || 0), 0),
    id: "TRAFFIC_VOLTE_KERL",
    metric_num: "TRAFFIC_VOLTE_KERL",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Max RRC User",
    tech: "4G",
    calculate: (filteredData) => {
      if (!filteredData || filteredData.length === 0) return 0;

      const values = filteredData
        .map((item) => item.G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER)
        .filter((value) => value !== null && value !== undefined && !Number.isNaN(value));

      if (values.length === 0) return 0;

      return Math.max(...values);
    },
    id: "G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER",
    metric_num: "G4_SUM_MAX_NUMBER_RRC_CONNECTION_USER",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Availability (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.AVAILABILITY_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.AVAILABILITY_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "AVAILABILITY_NUM",
    metric_num: "AVAILABILITY_NUM",
    metric_denum: "AVAILABILITY_DENUM",
  },
  {
    title: "RRC Setup Success Rate (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_RRC_SETUP_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_RRC_SETUP_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_RRC_SETUP_SR_NUM",
    metric_num: "G4_RRC_SETUP_SR_NUM",
    metric_denum: "G4_RRC_SETUP_SR_DENUM",
  },
  {
    title: "E-RAB Setup Success Rate (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_ERAB_SETUP_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_ERAB_SETUP_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_ERAB_SETUP_SR_NUM",
    metric_num: "G4_ERAB_SETUP_SR_NUM",
    metric_denum: "G4_ERAB_SETUP_SR_DENUM",
  },
  {
    title: "Call Setup Success Rate (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_CSSR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_CSSR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_CSSR_NUM",
    metric_num: "G4_CSSR_NUM",
    metric_denum: "G4_CSSR_DENUM",
  },
  {
    title: "Service Drop Rate (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_SERVICE_DROP_RATE_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_SERVICE_DROP_RATE_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_SERVICE_DROP_RATE_NUM",
    metric_num: "G4_SERVICE_DROP_RATE_NUM",
    metric_denum: "G4_SERVICE_DROP_RATE_DENUM",
  },
  {
    title: "DL PRB Utilization (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_DL_PRB_UTILIZATION_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_DL_PRB_UTILIZATION_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_DL_PRB_UTILIZATION_NUM",
    metric_num: "G4_DL_PRB_UTILIZATION_NUM",
    metric_denum: "G4_DL_PRB_UTILIZATION_DENUM",
  },
  {
    title: "UL PRB Utilization (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_UL_PRB_UTILIZATION_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_UL_PRB_UTILIZATION_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_UL_PRB_UTILIZATION_NUM",
    metric_num: "G4_UL_PRB_UTILIZATION_NUM",
    metric_denum: "G4_UL_PRB_UTILIZATION_DENUM",
  },

  {
    title: "User DL Throughput (Mbps)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_USER_DL_THP_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_USER_DL_THP_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum / 1000).toFixed(2)) : 0;
    },
    id: "G4_USER_DL_THP_NUM",
    metric_num: "G4_USER_DL_THP_NUM",
    metric_denum: "G4_USER_DL_THP_DENUM",
  },
  {
    title: "User UL Throughput (Mbps)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_USER_UL_THP_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_USER_UL_THP_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum / 1000).toFixed(2)) : 0;
    },
    id: "G4_USER_UL_THP_NUM",
    metric_num: "G4_USER_UL_THP_NUM",
    metric_denum: "G4_USER_UL_THP_DENUM",
  },
  {
    title: "SE",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_SE_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_SE_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum).toFixed(2)) : 0;
    },
    id: "G4_SE_NUM",
    metric_num: "G4_SE_NUM",
    metric_denum: "G4_SE_DENUM",
  },
  {
    title: "CQI",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_AVG_CQI_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_AVG_CQI_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum).toFixed(2)) : 0;
    },
    id: "G4_AVG_CQI_NUM",
    metric_num: "G4_AVG_CQI_NUM",
    metric_denum: "G4_AVG_CQI_DENUM",
  },
  {
    title: "CSFB Preparation (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_CSFB_SETUP_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_CSFB_SETUP_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_CSFB_SETUP_SR_NUM",
    metric_num: "G4_CSFB_SETUP_SR_NUM",
    metric_denum: "G4_CSFB_SETUP_SR_DENUM",
  },
  {
    title: "Intra Freq LTE HO (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_IFHO_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_IFHO_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_IFHO_SR_NUM",
    metric_num: "G4_IFHO_SR_NUM",
    metric_denum: "G4_IFHO_SR_DENUM",
  },
  {
    title: "Inter Freq LTE HO (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_INTER_FHO_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_INTER_FHO_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_INTER_FHO_SR_NUM",
    metric_num: "G4_INTER_FHO_SR_NUM",
    metric_denum: "G4_INTER_FHO_SR_DENUM",
  },
  {
    title: "SRVCC E2G SR (%)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_SRVCC_E2G_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_SRVCC_E2G_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G4_SRVCC_E2G_SR_NUM",
    metric_num: "G4_SRVCC_E2G_SR_NUM",
    metric_denum: "G4_SRVCC_E2G_SR_DENUM",
  },
];

// Generic filter function that can be shared
export const filterByDateRange = (
  data: Data2G4GModel[],
  startDate: string,
  endDate: string,
  timezone = "Asia/Makassar",
): Data2G4GModel[] => {
  if (!startDate || !endDate) return [];

  const start = startOfDay(toZonedTime(new Date(startDate), timezone));
  const end = endOfDay(toZonedTime(new Date(endDate), timezone));

  return data.filter((item) => {
    const itemDate = toZonedTime(new Date(item.BEGIN_TIME), timezone);
    return itemDate >= start && itemDate <= end;
  });
};
