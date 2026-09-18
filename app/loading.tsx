import { Wordmark } from "@/components/ui";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex flex-1 items-center justify-center py-24"
    >
      <span className="text-[48px]">
        <Wordmark />
      </span>
    </div>
  );
}
