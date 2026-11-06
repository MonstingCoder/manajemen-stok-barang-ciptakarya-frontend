const icons = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  box: "m21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8",
  tag: "m20 13-7 7-10-10V3h7l10 10ZM7.5 7.5h.01",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  search: "m20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  plus: "M12 5v14M5 12h14",
  arrow: "M5 12h14m-7-7 7 7-7 7",
  logout: "M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6",
  close: "m18 6-12 12M6 6l12 12",
  edit: "m16 4 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15l-.8 5Z",
  trash: "M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6",
  chevron: "m9 18 6-6-6-6",
  refresh: "M20 7v5h-5M4 17v-5h5m-4.1-3a8 8 0 0 1 13.3-3L20 7M4 17l1.8 1.8a8 8 0 0 0 13.3-3",
  check: "m5 12 4 4L19 6",
  warning: "M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z",
  mail: "M4 5h16v14H4zM4 7l8 6 8-6",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 1 1 8 0v4",
  calendar: "M4 5h16v16H4zM8 3v4m8-4v4M4 10h16",
  dots: "M5 12h.01M12 12h.01M19 12h.01",
} as const;

export type IconName = keyof typeof icons;

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  );
}
