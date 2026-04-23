// import { useQuery } from "@tanstack/react-query";
// import { getAll } from "../../../api/apiDeductionFromSalary";

// export function useFetchDeductionFromSalary(filterArray) {
//   const { isLoading, data, error } = useQuery({
//     queryKey: ["deduction_from_salary", filterArray],
//     queryFn: () => getAll(filterArray),
//     retry: false,
//     enabled: filterArray.length > 0,
//   });

//   return { isLoading, data, error };
// }
