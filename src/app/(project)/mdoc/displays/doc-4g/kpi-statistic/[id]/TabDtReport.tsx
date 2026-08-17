"use client";

import { useState } from "react";

import { DtReportTable } from "./DtReportTable";
import { ImageUploaderCard } from "./ImageUploaderCard";

interface ImageConfig {
  title: string;
  suffix: string;
  page: number;
}

export default function TabDtReportPage({ wid }: { wid: string }) {
  const [imageKeys, setImageKeys] = useState<Record<string, number>>({});

  const imageConfigs: ImageConfig[] = [
    { title: "Covmo Site RSRP", suffix: "covmo_site_rsrp", page: 2 },
    { title: "Covmo Site SINR", suffix: "covmo_site_sinr", page: 2 },
    {
      title: "Covmo Site DL Throughput",
      suffix: "covmo_site_dl_throughput",
      page: 2,
    },
    { title: "Covmo L900 Sector 1", suffix: "covmo_l900_sector_1", page: 3 },
    { title: "Covmo L900 Sector 2", suffix: "covmo_l900_sector_2", page: 3 },
    { title: "Covmo L900 Sector 3", suffix: "covmo_l900_sector_3", page: 3 },
    { title: "Covmo L1800 Sector 1", suffix: "covmo_l1800_sector_1", page: 3 },
    { title: "Covmo L1800 Sector 2", suffix: "covmo_l1800_sector_2", page: 3 },
    { title: "Covmo L1800 Sector 3", suffix: "covmo_l1800_sector_3", page: 3 },
    { title: "Covmo L2100 Sector 1", suffix: "covmo_l2100_sector_1", page: 4 },
    { title: "Covmo L2100 Sector 2", suffix: "covmo_l2100_sector_2", page: 4 },
    { title: "Covmo L2100 Sector 3", suffix: "covmo_l2100_sector_3", page: 4 },
    { title: "Panoramic View 0", suffix: "panoramic_view_0", page: 5 },
    { title: "Panoramic View 30", suffix: "panoramic_view_30", page: 5 },
    { title: "Panoramic View 60", suffix: "panoramic_view_60", page: 5 },
    { title: "Panoramic View 90", suffix: "panoramic_view_90", page: 5 },
    { title: "Panoramic View 120", suffix: "panoramic_view_120", page: 5 },
    { title: "Panoramic View 150", suffix: "panoramic_view_150", page: 5 },
    { title: "Panoramic View 180", suffix: "panoramic_view_180", page: 5 },
    { title: "Panoramic View 210", suffix: "panoramic_view_210", page: 5 },
    { title: "Panoramic View 240", suffix: "panoramic_view_240", page: 5 },
    { title: "Panoramic View 270", suffix: "panoramic_view_270", page: 5 },
    { title: "Panoramic View 300", suffix: "panoramic_view_300", page: 5 },
    { title: "Panoramic View 330", suffix: "panoramic_view_330", page: 5 },
    {
      title: "Data sectoral 1 - View",
      suffix: "data_sectoral_1_view",
      page: 6,
    },
    {
      title: "Data sectoral 1 - Azimuth",
      suffix: "data_sectoral_1_azimuth",
      page: 6,
    },
    { title: "Data sectoral 1 - ET", suffix: "data_sectoral_1_et", page: 6 },
    { title: "Data sectoral 1 - MT", suffix: "data_sectoral_1_mt", page: 6 },
    {
      title: "Data sectoral 1 - Height",
      suffix: "data_sectoral_1_height",
      page: 6,
    },
    {
      title: "Data sectoral 1 - Type",
      suffix: "data_sectoral_1_type",
      page: 6,
    },
    {
      title: "Data sectoral 2 - View",
      suffix: "data_sectoral_2_view",
      page: 7,
    },
    {
      title: "Data sectoral 2 - Azimuth",
      suffix: "data_sectoral_2_azimuth",
      page: 7,
    },
    { title: "Data sectoral 2 - ET", suffix: "data_sectoral_2_et", page: 7 },
    { title: "Data sectoral 2 - MT", suffix: "data_sectoral_2_mt", page: 7 },
    {
      title: "Data sectoral 2 - Height",
      suffix: "data_sectoral_2_height",
      page: 7,
    },
    {
      title: "Data sectoral 2 - Type",
      suffix: "data_sectoral_2_type",
      page: 7,
    },
    {
      title: "Data sectoral 3 - View",
      suffix: "data_sectoral_3_view",
      page: 8,
    },
    {
      title: "Data sectoral 3 - Azimuth",
      suffix: "data_sectoral_3_azimuth",
      page: 8,
    },
    { title: "Data sectoral 3 - ET", suffix: "data_sectoral_3_et", page: 8 },
    { title: "Data sectoral 3 - MT", suffix: "data_sectoral_3_mt", page: 8 },
    {
      title: "Data sectoral 3 - Height",
      suffix: "data_sectoral_3_height",
      page: 8,
    },
    {
      title: "Data sectoral 3 - Type",
      suffix: "data_sectoral_3_type",
      page: 8,
    },
    { title: "Data Site - Tower", suffix: "data_site_tower", page: 9 },
    { title: "Data Site - Rack", suffix: "data_site_rack", page: 9 },
    { title: "Data Site - GPS", suffix: "data_site_gps", page: 9 },
    { title: "Data Site - RET", suffix: "data_site_ret", page: 10 },
    {
      title: "Data Site - Validasi Longlat GE",
      suffix: "data_site_validasi_longlat_ge",
      page: 11,
    },
    {
      title: "Data Site - Validasi Longlat UME",
      suffix: "data_site_validasi_longlat_ume",
      page: 11,
    },
    { title: "Data Site - ACR", suffix: "data_site_acr", page: 12 },
    {
      title: "Data Site - Kabel Power 1",
      suffix: "data_site_kabel_power_1",
      page: 13,
    },
    {
      title: "Data Site - Kabel Power 2",
      suffix: "data_site_kabel_power_2",
      page: 13,
    },
    {
      title: "Data Site - Kabel Power 3",
      suffix: "data_site_kabel_power_3",
      page: 13,
    },
    {
      title: "Data Site - Bracket RRU L900 1",
      suffix: "data_site_bracket_rru_l900_1",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L900 2",
      suffix: "data_site_bracket_rru_l900_2",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L900 3",
      suffix: "data_site_bracket_rru_l900_3",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L1800 1",
      suffix: "data_site_bracket_rru_l1800_1",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L1800 2",
      suffix: "data_site_bracket_rru_l1800_2",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L1800 3",
      suffix: "data_site_bracket_rru_l1800_3",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L2100 1",
      suffix: "data_site_bracket_rru_l2100_1",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L2100 2",
      suffix: "data_site_bracket_rru_l2100_2",
      page: 14,
    },
    {
      title: "Data Site - Bracket RRU L2100 3",
      suffix: "data_site_bracket_rru_l2100_3",
      page: 14,
    },
    {
      title: "Data Site - Jumper Antena 1",
      suffix: "data_site_jumper_antena_1",
      page: 15,
    },
    {
      title: "Data Site - Jumper Antena 2",
      suffix: "data_site_jumper_antena_2",
      page: 15,
    },
    {
      title: "Data Site - Jumper Antena 3",
      suffix: "data_site_jumper_antena_3",
      page: 15,
    },
    {
      title: "Data Site - Bracket Antena 1",
      suffix: "data_site_bracket_antena_1",
      page: 15,
    },
    {
      title: "Data Site - Bracket Antena 2",
      suffix: "data_site_bracket_antena_2",
      page: 15,
    },
    {
      title: "Data Site - Bracket Antena 3",
      suffix: "data_site_bracket_antena_3",
      page: 15,
    },
  ];

  const setImageKey = (suffix: string) => (key: number) => {
    setImageKeys((prev) => ({ ...prev, [suffix]: key }));
  };

  return (
    <div className="space-y-12 p-2">
      {/* DT Report Data Table */}
      <DtReportTable wid={wid} />

      {/* Image uploaders grouped by page */}
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 2)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 3)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 4)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 5)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 6)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 7)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 8)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 9)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 10)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 11)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 12)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 13)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 14)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {imageConfigs
          .filter((item) => item.page === 15)
          .map((config) => (
            <ImageUploaderCard
              key={config.suffix}
              title={config.title}
              wid={wid}
              suffix={config.suffix}
              imageKey={imageKeys[config.suffix] ?? 0}
              setImageKey={setImageKey(config.suffix)}
            />
          ))}
      </div>
    </div>
  );
}
