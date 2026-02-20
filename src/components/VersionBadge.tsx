// Import version from package.json at build time
const version = "1.1.0"; // This will be updated by our versioning workflow

interface VersionBadgeProps {
  className?: string;
}

export function VersionBadge({ className = '' }: VersionBadgeProps) {
  const buildDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return (
    <div className={`inline-flex items-center gap-2 text-xs ${className}`}>
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-mono">
        v{version}
      </span>
      <span className="text-gray-500">
        Built {buildDate}
      </span>
    </div>
  );
}
