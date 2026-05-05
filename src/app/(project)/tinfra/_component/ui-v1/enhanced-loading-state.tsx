import { NoDataState } from "./additional-component";

export const EnhancedLoadingState = ({ message = "", subMessage = "" }: { message?: string; subMessage?: string }) => (
  <div className="space-y-4">
    {message && <div className="text-lg font-semibold">{message}</div>}
    {subMessage && <div className="text-sm text-gray-600">{subMessage}</div>}
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded bg-gray-200" />
        <div className="h-10 animate-pulse rounded bg-gray-200" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-64 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  </div>
);
