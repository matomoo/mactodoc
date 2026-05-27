export const extractSectorFromCellId = (cellId: number | string): string => {
  if (!cellId) return "Unknown";

  const cellIdStr = cellId.toString();

  // Rule: If len cellId = 3 then sector is left(cellid,2)
  if (cellIdStr.length === 3) {
    return `Sector ${cellIdStr.slice(0, 2)}`;
  }

  // Fallback: return first digit as sector
  return `Sector ${cellIdStr.charAt(0)}`;
};
