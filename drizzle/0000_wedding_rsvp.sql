CREATE TABLE rsvps (
  request_id TEXT PRIMARY KEY NOT NULL,
  receipt TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no', 'maybe')),
  guests INTEGER NOT NULL CHECK (guests BETWEEN 0 AND 6),
  note TEXT NOT NULL DEFAULT '',
  consent INTEGER NOT NULL CHECK (consent = 1),
  created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  count INTEGER NOT NULL,
  window INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX rate_window_idx ON rate_limits(window);
