import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="mb-2 text-6xl font-bold gradient-text">404</p>
      <h1 className="mb-3 text-2xl font-bold text-zinc-50">Page not found</h1>
      <p className="mb-8 max-w-md text-sm text-zinc-400">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Go home
        </Link>
        <Link href="/shop" className="btn btn-secondary">
          Browse shop
        </Link>
      </div>
    </div>
  );
}
