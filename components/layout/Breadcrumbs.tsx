import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);

  const crumbs: Crumb[] = [
    { label: 'Home', href: '/' },
    ...parts.map((part, idx) => {
      const href = '/' + parts.slice(0, idx + 1).join('/');
      const label = decodeURIComponent(part)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, href };
    }),
  ];

  // Hide breadcrumbs on root (dashboard) to avoid showing "Home" as title
  if (crumbs.length === 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 compact:gap-1.5">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-2 compact:gap-1.5">
              {i !== 0 && (
                <ChevronRight 
                  className="h-4 w-4 text-muted-foreground/50 compact:h-3.5 compact:w-3.5" 
                  aria-hidden="true" 
                />
              )}
              {isLast ? (
                <span className="text-sm font-semibold text-foreground compact:text-xs">
                  {c.label}
                </span>
              ) : (
                <Link 
                  href={c.href} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors compact:text-xs font-medium"
                >
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


