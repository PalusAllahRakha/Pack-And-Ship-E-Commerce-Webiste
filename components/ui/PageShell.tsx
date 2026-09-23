interface PageShellProps {
  title?: string;
  children?: React.ReactNode;
  hideTitle?: boolean;
  subtitle?: string;
}

export function PageShell({
  title,
  children,
  hideTitle,
  subtitle,
}: PageShellProps) {
  return (
    <main className="site-container flex-1 overflow-x-hidden py-6 sm:py-10 md:py-14">
      {!hideTitle && title && (
        <header className="mb-6 sm:mb-10">
          <p className="section-label mb-2">Pack &amp; Ship</p>
          <h1 className="theme-heading text-xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="theme-subtext mt-2 max-w-xl text-xs sm:text-base">{subtitle}</p>
          )}
        </header>
      )}
      {children}
    </main>
  );
}
