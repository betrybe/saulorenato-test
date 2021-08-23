function createLoadingSpan() {
  const loading = document.createElement('span');
  loading.className = 'loading';
  loading.innerText = 'loading...';
  document.querySelector('body').appendChild(loading);
}

function removeLoadingSpan() {
  const loading = document.querySelector('span.loading');
  document.querySelector('body').removeChild(loading);
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image, salePrice }) {
  const section = document.createElement('section');
  section.className = 'item';
  const divBox = document.createElement('div');
  divBox.className = 'box';
  section.appendChild(divBox);
  const divContent = document.createElement('div');
  divContent.className = 'content';
  divBox.appendChild(divContent);
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  divContent.appendChild(createCustomElement('span', 'item__title revertText ', name));
  divContent.appendChild(createCustomElement('span', 'item__title revertText ',
  `Preço: R$${salePrice.toFixed(2)}`));
  section.appendChild(createProductImageElement(image));
  divContent.appendChild(createCustomElement('button', 'item__add revertText',
  'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

async function fetchItemById(itemId) {
  createLoadingSpan();
  const endPoint = `https://api.mercadolibre.com/items/${itemId}`;
  const response = await fetch(endPoint);
  removeLoadingSpan();
  return response.json();
}

async function sumAllItemPricesOnCart() {
  let sumPrices = 0;
  const allCartItens = document.querySelectorAll('.cart__item');
  allCartItens.forEach((item) => { sumPrices += +item.innerText.split('$')[1]; });
  document.querySelector('.total-price').innerText = sumPrices.toFixed(2);
}

async function cartCounter() {
  const liCounter = document.querySelectorAll(); 
  document.querySelector('.itemsCounter').innerText = liCounter;
}

function storageCart() {
  const allProductsDetails = document.querySelectorAll('ol.cart__items');
  allProductsDetails.forEach((product) => {
    localStorage.setItem('cartProducts', product.innerHTML);
  });
  sumAllItemPricesOnCart();
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  event.target.remove();
  sumAllItemPricesOnCart();
  storageCart();
  cartCounter();
}

function clearCart() {
  const buttomClear = document.querySelector('.empty-cart');
  buttomClear.addEventListener('click', () => {
    document.querySelectorAll('.cart__item')
    .forEach((li) => li.remove());
    sumAllItemPricesOnCart();
    storageCart();
    cartCounter();
  });
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

async function sendItemToCart(event) {
  const section = event.target.parentNode.parentNode.parentNode;
  const productId = getSkuFromProductItem(section);
  const { id, title, price } = await fetchItemById(productId);
  const cartElement = createCartItemElement({ sku: id, name: title, salePrice: price });
  document.querySelector('.cart__items').appendChild(cartElement);
  sumAllItemPricesOnCart();
  storageCart();
  cartCounter();
}

function addItem() {
  const buttonAdd = document.querySelectorAll('button.item__add');
  buttonAdd.forEach((button) => {
    button.addEventListener('click', sendItemToCart);
  });
}

function loadStorageCart() {
  document.querySelector('ol.cart__items').innerHTML = localStorage.getItem('cartProducts');
  document.querySelectorAll('li.cart__item')
  .forEach((li) => li.addEventListener('click', cartItemClickListener));
  sumAllItemPricesOnCart();
  cartCounter();
}

async function fetchAllProducts(productType) {
  createLoadingSpan();
  document.querySelectorAll('.item').forEach((item) => item.remove());
  const endPoint = `https://api.mercadolibre.com/sites/MLB/search?q=${productType}`;
  const response = await fetch(endPoint);
  const object = await response.json();
  removeLoadingSpan();
  const { results } = object;
  results.forEach((result) => {
    const { id, title, thumbnail, price } = result;
    const structure = createProductItemElement(
      { sku: id, name: title, image: thumbnail, salePrice: price },
);
    document.querySelector('.items').appendChild(structure);
  });
  addItem();
  cartCounter();
}

function cartDisplayChanger() {
  const sectionCart = document.querySelector('section.cart');
  const cartDisplay = getComputedStyle(sectionCart).display;
  if (cartDisplay === 'flex') {
    sectionCart.style.display = 'none';
  } else {
    sectionCart.style.display = 'flex';
  }
}

function cartListener() {
  document.querySelector('.displayCart').addEventListener('click', cartDisplayChanger);
}

 /* async function cartCounter() {
  const liCounter = document.querySelectorAll('.cart__item').length;
  document.querySelector('.itemsCounter').innerText = liCounter;
} */

async function getInput() {
  const input = document.querySelector('.search');
  const button = document.querySelector('.submit');
  button.addEventListener('click', () => {
    if (input.value === '') {
      alert('Set any product to search');
      fetchAllProducts('computador');
    }
    fetchAllProducts(input.value);
  });
    input.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      fetchAllProducts(input.value);
    }
    if (event.keyCode === 13 && input.value === '') {
      alert('Set any product to search');
      fetchAllProducts('computador');
    }
  });
}

window.onload = function onload() {
  fetchAllProducts('computador');
  clearCart();
  loadStorageCart();
  cartListener();
  cartCounter();
  getInput();
};
