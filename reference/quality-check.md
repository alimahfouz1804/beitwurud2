# Delivery verification

Checked on 13 October 2026 in Chromium.

- All three pages tested at **320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920 pixels** wide: 27 page/width checks, with no horizontal overflow or broken images.
- Desktop and mobile screenshots reviewed for layout, photo placement, readable menu rows and the cart drawer.
- All **54 café items** and their prices matched to the two supplied menu photographs; category grouping retained.
- All local image paths, page links and anchor links resolve; image alternative text and unique IDs checked.
- Mobile navigation opens and closes; Escape works.
- Both flower products can be added, quantities increased/decreased and products removed.
- Cart count and contents persist after reload and navigation across the three pages.
- Empty cart checkout is disabled; Continue shopping closes the drawer.
- WhatsApp order draft uses **96176974565**, correct products and quantities, and no invented price total. Cart remains intact.
- Custom-design draft exactly matches the requested message.
- Gallery lightbox opens and closes using Escape.
- Six independent cart logic tests passed, including corrupt saved data, quantity limits, unpriced items, mixed prices, separate currencies and encoded WhatsApp URLs.
- No JavaScript runtime errors or failed local HTTP resources were observed.
- Reduced-motion mode tested; the site remains usable without animations.

WhatsApp drafts were intercepted for inspection during testing. No message was sent to the business. Physical-device and Safari-specific testing were not performed.
