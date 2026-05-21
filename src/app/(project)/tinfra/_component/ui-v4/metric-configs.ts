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
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_TCH_TRAFFIC_ERL || 0), 0),
    growthType: "successRate100",
    id: "G2_TCH_TRAFFIC_ERL",
    metric_num: "G2_TCH_TRAFFIC_ERL",
    metric_denum: "DENUMBY1",
  },
  {
    title: "SDCCH Traffic (Erl)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_SD_TRAFFIC_ERL || 0), 0),
    id: "G2_SD_TRAFFIC_ERL",
    metric_num: "G2_SD_TRAFFIC_ERL",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Total Payload (GB)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_PAYLOAD_GB || 0), 0),
    id: "G2_PAYLOAD_GB",
    metric_num: "G2_PAYLOAD_GB",
    metric_denum: "DENUMBY1",
  },
  {
    title: "SDSR (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_SDSR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_SDSR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate100",
    id: "G2_SDSR_NUM",
    metric_num: "G2_SDSR_NUM",
    metric_denum: "G2_SDSR_DENUM",
  },
  {
    title: "SDCCH Block (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_SDBLOCK_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_SDBLOCK_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate0",
    id: "G2_SDBLOCK_NUM",
    metric_num: "G2_SDBLOCK_NUM",
    metric_denum: "G2_SDBLOCK_DENUM",
  },
  {
    title: "TCH Block (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_TCH_BLOCK_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_TCH_BLOCK_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate0",
    id: "G2_TCH_BLOCK_NUM",
    metric_num: "G2_TCH_BLOCK_NUM",
    metric_denum: "G2_TCH_BLOCK_DENUM",
  },
  {
    title: "TBF DL Establish (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_TBF_DL_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_TBF_DL_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? 100 - Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    growthType: "successRate100",
    id: "G2_TBF_DL_NUM",
    metric_num: "G2_TBF_DL_NUM",
    metric_denum: "G2_TBF_DL_DENUM",
  },
  {
    title: "TBF UL Establish (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_TBF_UL_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_TBF_UL_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? 100 - Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_TBF_UL_NUM",
    metric_num: "G2_TBF_UL_NUM",
    metric_denum: "G2_TBF_UL_DENUM",
  },
  {
    title: "TCH Drop (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_TCH_DROP_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_TCH_DROP_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_TCH_DROP_NUM",
    metric_num: "G2_TCH_DROP_NUM",
    metric_denum: "G2_TCH_DROP_DENUM",
  },
  {
    title: "TBF Completion SR (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_TBF_COMP_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_TBF_COMP_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_TBF_COMP_NUM",
    metric_num: "G2_TBF_COMP_NUM",
    metric_denum: "G2_TBF_COMP_DENUM",
  },
  {
    title: "EDGE DL Throughput (Kbps)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_EDGE_DL_THP_KBPS || 0), 0),
    id: "G2_EDGE_DL_THP_KBPS",
    metric_num: "G2_EDGE_DL_THP_KBPS",
    metric_denum: "DENUMBY1",
  },
  {
    title: "GPRS DL Throughput (kbps)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_GPRS_DL_THP_KBPS || 0), 0),
    id: "G2_GPRS_DL_THP_KBPS",
    metric_num: "G2_GPRS_DL_THP_KBPS",
    metric_denum: "DENUMBY1",
  },
  {
    title: "HOSR (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_HOSR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_HOSR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_HOSR_NUM",
    metric_num: "G2_HOSR_NUM",
    metric_denum: "G2_HOSR_DENUM",
  },
  {
    title: "TCH Availability (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_TCH_AVAILABILITY_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_TCH_AVAILABILITY_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_TCH_AVAILABILITY_NUM",
    metric_num: "G2_TCH_AVAILABILITY_NUM",
    metric_denum: "G2_TCH_AVAILABILITY_DENUM",
  },
  {
    title: "DL_RX_Qual_0_5",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_DL_QUAL_05_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_DL_QUAL_05_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_DL_QUAL_05_NUM",
    metric_num: "G2_DL_QUAL_05_NUM",
    metric_denum: "G2_DL_QUAL_05_DENUM",
  },
  {
    title: "UL_RX_Qual_0_5",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_UL_QUAL_05_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_UL_QUAL_05_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_UL_QUAL_05_NUM",
    metric_num: "G2_UL_QUAL_05_NUM",
    metric_denum: "G2_UL_QUAL_05_DENUM",
  },
  {
    title: "Number of TRX",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_TRX || 0), 0),
    id: "G2_NUMBER_TRX",
    metric_num: "G2_NUMBER_TRX",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Number of TCH",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_TCH || 0), 0),
    id: "G2_NUMBER_TCH",
    metric_num: "G2_NUMBER_TCH",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Number of SDCCH",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_SDCCH || 0), 0),
    id: "G2_NUMBER_SDCCH",
    metric_num: "G2_NUMBER_SDCCH",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Number of Static PDTCH",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_STATIC_PDTCH || 0), 0),
    id: "G2_NUMBER_STATIC_PDTCH",
    metric_num: "G2_NUMBER_STATIC_PDTCH",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Number of Dynamic PDTCH",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_DYNAMIC_PDTCH || 0), 0),
    id: "G2_NUMBER_DYNAMIC_PDTCH",
    metric_num: "G2_NUMBER_DYNAMIC_PDTCH",
    metric_denum: "DENUMBY1",
  },
  {
    title: "ICM Interference (%)",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_ICM_INTERFERENCE_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_ICM_INTERFERENCE_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number(((totalNum / totalDenum) * 100).toFixed(2)) : 0;
    },
    id: "G2_ICM_INTERFERENCE_NUM",
    metric_num: "G2_ICM_INTERFERENCE_NUM",
    metric_denum: "G2_ICM_INTERFERENCE_DENUM",
  },
  {
    title: "TCH HR Traffic (Erl)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_TCH_HR_TRAFFIC_ERL || 0), 0),
    id: "G2_TCH_HR_TRAFFIC_ERL",
    metric_num: "G2_TCH_HR_TRAFFIC_ERL",
    metric_denum: "DENUMBY1",
  },
  {
    title: "TCH FR Traffic (Erl)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_TCH_FR_TRAFFIC_ERL || 0), 0),
    id: "G2_TCH_FR_TRAFFIC_ERL",
    metric_num: "G2_TCH_FR_TRAFFIC_ERL",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Number of Fast Return to UTRAN",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_FASTRETURN_UTRAN || 0), 0),
    id: "G2_NUMBER_FASTRETURN_UTRAN",
    metric_num: "G2_NUMBER_FASTRETURN_UTRAN",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Number of Fast Return to LTE",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_NUMBER_FASTRETURN_LTE || 0), 0),
    id: "G2_NUMBER_FASTRETURN_LTE",
    metric_num: "G2_NUMBER_FASTRETURN_LTE",
    metric_denum: "DENUMBY1",
  },
  {
    title: "DL EMI",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_DL_EMI_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_DL_EMI_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum).toFixed(2)) : 0;
    },
    id: "G2_DL_EMI_NUM",
    metric_num: "G2_DL_EMI_NUM",
    metric_denum: "G2_DL_EMI_DENUM",
  },
  {
    title: "UL EMI",
    tech: "2G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G2_UL_EMI_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G2_UL_EMI_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum).toFixed(2)) : 0;
    },
    id: "G2_UL_EMI_NUM",
    metric_num: "G2_UL_EMI_NUM",
    metric_denum: "G2_UL_EMI_DENUM",
  },
  {
    title: "SD to TCH Success Rate (%)",
    tech: "2G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G2_SD_TO_TCH_SR || 0), 0),
    id: "G2_SD_TO_TCH_SR",
    metric_num: "G2_SD_TO_TCH_SR",
    metric_denum: "DENUMBY1",
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
    title: "Traffic VoLTE (Erl)",
    tech: "4G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TRAFFIC_VOLTE_ERL || 0), 0),
    id: "TRAFFIC_VOLTE_ERL",
    metric_num: "TRAFFIC_VOLTE_ERL",
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
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
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
    title: "DL PRB Utilization BH (%)",
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
    title: "UL PRB Utilization BH (%)",
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
    title: "User DL Throughput BH (Mbps)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_USER_DL_THP_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_USER_DL_THP_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum).toFixed(2)) : 0;
    },
    id: "G4_USER_DL_THP_NUM",
    metric_num: "G4_USER_DL_THP_NUM",
    metric_denum: "G4_USER_DL_THP_DENUM",
  },
  {
    title: "User UL Throughput BH (Mbps)",
    tech: "4G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G4_USER_UL_THP_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G4_USER_UL_THP_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) > 0 ? Number((totalNum / totalDenum).toFixed(2)) : 0;
    },
    id: "G4_USER_UL_THP_NUM",
    metric_num: "G4_USER_UL_THP_NUM",
    metric_denum: "G4_USER_UL_THP_DENUM",
  },
  {
    title: "SE BH",
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
    title: "CQI BH",
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
    title: "Average NI Carrier (dBm)",
    tech: "4G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G4_AVG_NI_CARRIER_DBM || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G4_AVG_NI_CARRIER_DBM",
    metric_num: "G4_AVG_NI_CARRIER_DBM",
    metric_denum: "DENUMBY1",
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
  //
  //// metric 5G
  {
    title: "Total Payload (GB)",
    tech: "5G",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.G5_PAYLOAD_GB || 0), 0),
    id: "G5_PAYLOAD_GB",
    metric_num: "G5_PAYLOAD_GB",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Availability (%)",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_AVAILABILITY_SR || 0), 0);
      return filteredData.length > 0 ? (sum / filteredData.length) * 100 : 0;
    },
    id: "G5_AVAILABILITY_SR",
    metric_num: "G5_AVAILABILITY_SR",
    metric_denum: "DENUMBY1",
  },
  {
    title: "SN Setup Success Rate(%)",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_SN_SETUP_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_SN_SETUP_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
    },
    id: "G5_SN_SETUP_SR_NUM",
    metric_num: "G5_SN_SETUP_SR_NUM",
    metric_denum: "G5_SN_SETUP_SR_DENUM",
  },
  {
    title: "NR Retainability (%)",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_RETAINABILITY_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_RETAINABILITY_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0 ? 0 : Number((totalNum / totalDenum).toFixed(2));
    },
    id: "G5_RETAINABILITY_NUM",
    metric_num: "G5_RETAINABILITY_NUM",
    metric_denum: "G5_RETAINABILITY_DENUM",
  },
  {
    title: "Intra Handover Success Rate (%)",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_INTRA_HO_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_INTRA_HO_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
    },
    id: "G5_INTRA_HO_SR_NUM",
    metric_num: "G5_INTRA_HO_SR_NUM",
    metric_denum: "G5_INTRA_HO_SR_DENUM",
  },
  {
    title: "Inter Handover Success Rate (%)",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_INTER_HO_SR_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_INTER_HO_SR_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
    },
    id: "G5_INTER_HO_SR_NUM",
    metric_num: "G5_INTER_HO_SR_NUM",
    metric_denum: "G5_INTER_HO_SR_DENUM",
  },
  {
    title: "User Throughput DL (Mbps)",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_USER_THP_MBPS || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_USER_THP_MBPS",
    metric_num: "G5_USER_THP_MBPS",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Average CQI",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_AVG_CQI || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_AVG_CQI",
    metric_num: "G5_AVG_CQI",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Uplink Interference (dBm)",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_UL_INTERFERENCE_DBM || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_UL_INTERFERENCE_DBM",
    metric_num: "G5_UL_INTERFERENCE_DBM",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Spectrum Eff",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_SE_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_SE_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
    },
    id: "G5_SE_NUM",
    metric_num: "G5_SE_NUM",
    metric_denum: "G5_SE_DENUM",
  },
  {
    title: "RRC User Number",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_RRC_USER_NUMBER || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_RRC_USER_NUMBER",
    metric_num: "G5_RRC_USER_NUMBER",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Active User Number",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_ACTIVE_USER_NUMBER || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_ACTIVE_USER_NUMBER",
    metric_num: "G5_ACTIVE_USER_NUMBER",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Max RRC User Number",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_MAX_RRC_USER_NUMBER || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_MAX_RRC_USER_NUMBER",
    metric_num: "G5_MAX_RRC_USER_NUMBER",
    metric_denum: "DENUMBY1",
  },
  {
    title: "PRB DL Utilization (%)",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_PRB_UTIL_DL_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_PRB_UTIL_DL_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
    },
    id: "G5_PRB_UTIL_DL_NUM",
    metric_num: "G5_PRB_UTIL_DL_NUM",
    metric_denum: "G5_PRB_UTIL_DL_DENUM",
  },
  {
    title: "PRB UL Utilization (%)",
    tech: "5G",
    calculate: (filteredData) => {
      const totalNum = filteredData.reduce((sum, item) => sum + (item.G5_PRB_UTIL_UL_NUM || 0), 0);
      const totalDenum = filteredData.reduce((sum, item) => sum + (item.G5_PRB_UTIL_UL_DENUM || 0), 0);
      return Number(totalDenum.toFixed(2)) < 0
        ? 0
        : totalNum > totalDenum
          ? 100.0
          : Number(((totalNum / totalDenum) * 100).toFixed(2));
    },
    id: "G5_PRB_UTIL_UL_NUM",
    metric_num: "G5_PRB_UTIL_UL_NUM",
    metric_denum: "G5_PRB_UTIL_UL_DENUM",
  },
  {
    title: "Avg CQI 64 QAM",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_AVG_CQI_64_QAM || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_AVG_CQI_64_QAM",
    metric_num: "G5_AVG_CQI_64_QAM",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Avg CQI 256 QAM",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_AVG_CQI_256_QAM || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_AVG_CQI_256_QAM",
    metric_num: "G5_AVG_CQI_256_QAM",
    metric_denum: "DENUMBY1",
  },
  {
    title: "PRB Usage DL",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_PRB_USAGE_DL || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_PRB_USAGE_DL",
    metric_num: "G5_PRB_USAGE_DL",
    metric_denum: "DENUMBY1",
  },
  {
    title: "PRB Usage UL",
    tech: "5G",
    calculate: (filteredData) => {
      const sum = filteredData.reduce((total, item) => total + (item.G5_PRB_USAGE_UL || 0), 0);
      return filteredData.length > 0 ? sum / filteredData.length : 0;
    },
    id: "G5_PRB_USAGE_UL",
    metric_num: "G5_PRB_USAGE_UL",
    metric_denum: "DENUMBY1",
  },

  //// metric productivity all
  {
    title: "Total Payload (GB)",
    tech: "All",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TOTAL_PAYLOAD_GB || 0), 0),
    id: "TOTAL_PAYLOAD_GB",
    metric_num: "TOTAL_PAYLOAD_GB",
    metric_denum: "DENUMBY1",
  },
  {
    title: "Total Traffic (Erl)",
    tech: "All",
    calculate: (filteredData) => filteredData.reduce((sum, item) => sum + (item.TOTAL_TRAFFIC_ERL || 0), 0),
    id: "TOTAL_TRAFFIC_ERL",
    metric_num: "TOTAL_TRAFFIC_ERL",
    metric_denum: "DENUMBY1",
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
