/**
 * Suppress non-critical deprecation warnings from Three.js
 * This helps keep the console clean while the upstream libraries haven't updated
 */
export function suppressDeprecationWarnings() {
  if (typeof window === "undefined") return;

  const originalWarn = console.warn;
  const originalError = console.error;

  // List of warnings to suppress
  const suppressedPatterns = [
    /THREE\.Clock.*deprecated.*THREE\.Timer/i,
    /THREE\.WebGLShadowMap.*PCFSoftShadowMap.*deprecated/i,
    /THREE\.WebGLProgram.*Program Info Log/i,
  ];

  const shouldSuppress = (message: string): boolean => {
    return suppressedPatterns.some((pattern) => pattern.test(message));
  };

  console.warn = function (...args: any[]) {
    const message = String(args[0] || "");
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };

  console.error = function (...args: any[]) {
    const message = String(args[0] || "");
    // Don't suppress errors, only warnings
    originalError.apply(console, args);
  };

  // Also set up global error listener for WebGL context loss
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      if (event.message?.includes?.("WebGL")) {
        event.preventDefault();
      }
    });
  }
}
