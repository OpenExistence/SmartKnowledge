type BadgeVariant = 'recorded' | 'transcribed' | 'indexed' | 'pending' | 'error';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
}

export function StatusBadge({ variant, label }: StatusBadgeProps) {
  const variants = {
    recorded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    transcribed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    indexed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  );
}
