// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import { salesTransactionsService } from "../lib/services/salesTransactions";

export const useSalesTransactions = () => {
  return useQuery({
    queryKey: ["salesTransactions"],
    queryFn: () => salesTransactionsService.getAll(),
  });
};
