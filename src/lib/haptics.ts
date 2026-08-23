/**
 * Trigger haptic feedback on supported devices.
 * Falls back gracefully on desktop/unsupported browsers.
 */
export function haptic(style: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  if (!navigator.vibrate) return;

  switch (style) {
    case "light":
      navigator.vibrate(5);
      break;
    case "medium":
      navigator.vibrate(10);
      break;
    case "heavy":
      navigator.vibrate(20);
      break;
    case "success":
      navigator.vibrate([5, 30, 10]);
      break;
    case "error":
      navigator.vibrate([20, 50, 20, 50, 20]);
      break;
  }
}
