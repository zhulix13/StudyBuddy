import { vi, beforeAll, afterEach } from "vitest";

// Example: Mock console errors/warnings to keep test output clean
beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// Example: Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

// Example: Set a fake ENV variable for tests
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_KEY = "fake-key-for-tests";
