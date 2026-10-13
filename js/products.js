(function (global) {
  'use strict';

  // BUSINESS CONTACT: keep the WhatsApp number in international format,
  // digits only (country code + number, without +, spaces, or a leading 00).
  // Leaving this blank keeps orders available to copy without inventing a number.
  var config = {
    whatsappNumber: '96176974565',
    currency: 'USD'
  };

  // EDITABLE FLOWER CATALOGUE
  // The supplied photos did not include official product names or prices.
  // These descriptive names are placeholders. Replace them with approved names
  // and set placeholderName to false. Set a numeric price and currency only when
  // confirmed; null displays "Price on request" and never becomes a zero price.
  var products = [
    {
      id: 'red-bouquet',
      name: 'Red Rose Bouquet',
      placeholderName: true,
      category: 'bouquets',
      price: null,
      currency: null,
      image: 'assets/images/flower-1.webp',
      alt: 'Red rose bouquet from Beit Wurud'
    },
    {
      id: 'blue-bouquet',
      name: 'Blue & White Bouquet',
      placeholderName: true,
      category: 'bouquets',
      price: null,
      currency: null,
      image: 'assets/images/flower-2.webp',
      alt: 'Blue and white flower bouquet from Beit Wurud'
    }
  ];

  global.BeitWurudConfig = config;
  global.BeitWurudProducts = products;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { config: config, products: products };
  }
})(typeof window !== 'undefined' ? window : globalThis);
