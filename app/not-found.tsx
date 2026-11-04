import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 px-4">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-2xl font-medium text-secondary">That page doesn’t exist.</p>
      <Link href="/" className="link-body text-xl">
        Back home
      </Link>
    </div>
  );
}
