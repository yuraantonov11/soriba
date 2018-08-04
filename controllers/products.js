const products = [{
  title: 'First Item',
  image: 'https://i.imgur.com/2AaBlpf.png',
  price: 128,
  currency: 'USD',
  rating: 2,
  tags: ['tag1', 'tag2', 'tag3', 'tag4'],
}, {
  title: 'Second Item',
  image: 'url',
  price: 123,
  currency: 'USD',
  rating: 5,
  tags: ['tag1', 'tag1', 'tag1'],
}];

/**
 * GET /
 * Products page.
 */
exports.index = (req, res) => {
  res.render('products', {
    title: 'All Products',
    products
  });
};

/**
 * GET /
 * Product page.
 */
exports.product = (req, res) => {
  res.render('products/product', {
    title: 'Product',
    products: products[0]
  });
};
