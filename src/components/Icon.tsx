const paths: Record<string, string> = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  book: 'M12 5v16M12 5C8 2 4 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-6-2-10 1Z',
  review: 'M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l3 2',
  chart: 'M4 3v18h17M8 16v-5M13 16V7M18 16V4',
  spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  building: 'M3 9h18L12 3 3 9ZM5 10v9M10 10v9M14 10v9M19 10v9M2 21h20',
  balance: 'M12 3v18M8 21h8M4 6h16M5 6l-3 7h6L5 6ZM19 6l-3 7h6l-3-7Z',
  compass: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-5-4-3 5-5 3 3-5 5-3Z',
  heart: 'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-3 3-1 7 1 9l7 7 7-7c3-3 4-6 1-9Z',
  target: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-4 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Zm-5 0h.01',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  flame: 'M12 2c1 5 6 7 6 12a6 6 0 0 1-12 0c0-3 1-5 3-7 0 4 2 5 3 5 2-3 1-6 0-10Z',
  award: 'M18 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM8 13l-1 9 5-3 5 3-1-9',
  settings:
    'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM10 2h4l1 4 3-1 3 3-1 3 2 1v4l-4 1 1 3-3 2-3-1-1 2h-4l-1-4-3 1-2-3 1-3-2-1V9l4-1-1-3 3-2 3 1 1-2Z',
  link: 'm10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0',
  shield: 'm12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Zm-4 10 3 3 5-6',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  audio: 'M3 9h4l5-4v14l-5-4H3V9ZM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14',
  download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
};

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <svg
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
      <path d={paths[name] ?? paths.book} />
    </svg>
  );
}
