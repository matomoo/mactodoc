export const formatActivityDetails = (
  action: string,
  entity: string,
  data: Record<string, any>,
  previousData?: Record<string, any>,
): { structured: string; readable: string } => {
  // Structured JSON for programmatic use
  const structured = JSON.stringify({
    action,
    entity,
    timestamp: new Date().toISOString(),
    newData: data,
    ...(previousData && { previousData }),
  });

  // Human readable format
  let readable = "";
  switch (action) {
    case "CREATE":
      readable = `Created ${entity} "${data.name || data.id}"`;
      break;
    case "UPDATE": {
      const changes = previousData ? Object.keys(data).filter((key) => previousData[key] !== data[key]) : [];
      readable =
        changes.length > 0
          ? `Updated ${entity} "${data.name || data.id}": Changed ${changes.join(", ")}`
          : `Updated ${entity} "${data.name || data.id}"`;
      break;
    }
    case "DELETE":
      readable = `Deleted ${entity} "${data.name || data.id}"`;
      break;
  }

  return { structured, readable };
};
