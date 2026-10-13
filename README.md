# Beit Wurud

A complete, responsive, three-page flower boutique and café website. Built with HTML, CSS and vanilla JavaScript, with no framework, installation or build step required.

## Open the website

Unzip the delivery, open the `beit-wurud` folder, then open `index.html` in a modern browser. For a full check of cart persistence between pages, use a local web server or static hosting: browsers can treat storage differently when HTML files are opened directly.

## Publish on static hosting

- **Netlify:** upload the `beit-wurud` folder in a manual deployment. `index.html` must be at the root of the uploaded folder. No build command is needed.
- **GitHub Pages:** place the contents of `beit-wurud` at the root of your Pages source, then enable Pages for that source. All internal paths are relative, including on a project subpath.
- **Other hosts:** upload this folder's contents to your public web directory.

The site does not require a server application, database, API key or payment service. Keep `index.html`, `flowers.html`, `menu.html`, `css`, `js` and `assets` together. The `reference` folder contains the original menu photographs, transcription and asset notes for the owner; it is not used to display the menu and can be excluded from hosting.

## Business details

- WhatsApp: **+961 76 974 565**, supplied by the owner.
- Instagram: **@beit.wurud**, printed on the supplied café menu.
- No address or opening hours were supplied, so none have been invented.
- Flower names are explicitly marked as temporary. No flower prices were supplied, so both products show **Price on Request**.

## Edit flowers and contact details

Open `js/products.js` in a text editor. At the top, `whatsappNumber` is the international number with digits only. The two catalogue entries contain editable names, images, prices and currencies. Keep the existing product IDs unchanged to preserve saved baskets.

For an approved product name, update `name` and set `placeholderName: false`. For an approved price, replace `price: null` with a number and set `currency` to its three-letter currency code. The card text and cart update from these values when JavaScript loads. Also update the matching fallback name/price in `flowers.html` for visitors without JavaScript, and remove the temporary-name introduction when both names are approved.

Only the two supplied bouquet products are listed. Flower boxes shown as part of interior photographs have not been invented as sale products. To add a confirmed box or bouquet later, add its catalogue entry and a corresponding product card in `flowers.html`; use a unique product ID in `data-product-id`.

## Edit the café menu

All **54 items across seven categories** are actual HTML text in `menu.html`. Change a name or price directly in its menu row. Update `reference/menu-transcription.json` at the same time to keep your reference current.

The original category names and item wording have been retained, including unusual source spellings such as “Raff”, “Mocca”, “Foundant” and “Chicken Junkless”. Decimal commas in three hot drink prices have been normalized to decimal points; numeric values are unchanged. No ingredients or descriptions have been added.

## Ordering behavior

1. Select a bouquet quantity and add it to the flower basket.
2. Review the products, change quantities or remove an item.
3. Choose **Order via WhatsApp** to open a prepared message addressed to Beit Wurud.
4. The customer reviews and sends the message in WhatsApp. Opening WhatsApp does not clear the basket or confirm the order.

The cart is saved in browser local storage and shared across this site's pages. It is not a server order record and does not take payment. No invented flower total is displayed. If real prices are added later, the cart calculates totals for priced items and keeps different currencies separate. Availability and final order details are confirmed with the shop.

The custom-design button uses the exact message requested in the brief. If the contact field is ever left blank, a copyable draft is provided instead of opening an invalid number.

## Included features

- Three responsive pages with a shared navigation, active-page markers and footer.
- Original olive logo, storefront hero and all supplied interior/product/design photographs.
- Optimized WebP images, mobile image variants and below-the-fold lazy loading.
- Mobile navigation, keyboard-accessible cart and image lightbox.
- Gentle entrance and scroll animations, with reduced-motion support.
- Local fonts, no external font requests and no third-party JavaScript dependencies.
- Visible focus states, descriptive image text, semantic page headings and readable menu rows.

See `reference/quality-check.md` for delivery verification.
