// biome-ignore assist/source/organizeImports: <none>
import { useQuery } from "@tanstack/react-query";
import { testTypesService } from "../lib/services/testTypes";

export const useTestTypes = () => {
  return useQuery({
    queryKey: ["testTypes"],
    queryFn: () => testTypesService.getAll(),
  });
};
