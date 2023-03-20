function addElement(container, type, className, innerText, id, attributes) {
    let element = document.createElement(type);
    if (id != null && id !== '') {
        element.id = id;
    }

    if (className != null && className !== '') {
        element.className = className;
    }

    if (attributes != null) {
        if (attributes instanceof Map) {
            attributes.forEach((value, key) => {
                element.setAttribute(key, value);
            })
        }
    }

    if (innerText != null) {
        element.innerText = innerText;
    }

    container.append(element);
    return element;
}

var fragment = new DocumentFragment();
let body = document.querySelector("body");
body.id = 'app';

let popupContainer = addElement(body, 'div', 'popup', null, 'book-descr');

let header = addElement(body, 'header', 'header');
let main = addElement(body, 'main', 'main');
let footer = addElement(body, 'footer', 'footer');

fragment.appendChild(popupContainer);
fragment.appendChild(header);
fragment.appendChild(main);
fragment.appendChild(footer);

document.getElementById("app").appendChild(fragment);

const renderDescPopup = function(container, header, author, description) {
    let descContainer = addElement(container, 'div', 'popup__content');
    let descHeader = addElement(descContainer, 'div', 'popup__header');
    addElement(descHeader, 'h2', 'popup__title', header);

    let closeBtn = addElement(descHeader, 'a', 'close', null, null,
        new Map([
        ['href', '#']
        ]));

    addElement(closeBtn, 'i', 'fa-solid fa-xmark');

    addElement(descContainer, 'h3', 'popup__author', author);
    addElement(descContainer, 'p', 'popup__description', description);
}

const renderHeader = function () {
    let wrapper = addElement(header, 'div','wrapper');
    let icoContainer = addElement(wrapper, 'div');
    addElement(icoContainer, 'a', 'header__ico', 'BookShop', null,
        new Map([
            ['href', '../main/']
        ]));

    addElement(wrapper, 'div', 'header__motto', 'Books build a stairway to your imagination')

    let bag = addElement(wrapper, 'div', 'header__bag', null, null,
        new Map([
            ['ondrop', 'drop(event)'],
            ['ondragover', 'allowDrop(event)']
        ]));

    addElement(bag, 'i', 'header__bag-ico fa-solid fa-cart-shopping');

    addElement(bag, 'span', 'header__bag-sum', ' 0$ ', 'header-cart');
    let toggleCartIco = addElement(bag, 'i', 'header__bag-show-ico fa-solid fa-angle-down', null, 'cart-toggler');
    toggleCartIco.addEventListener('click', toggleCartOpen);

    updateCartSum();
}

const renderBook = function (container, id, item) {
    let book = document.createElement('div');
    book.draggable = true;
    book.addEventListener('dragstart', drag);

    let figure = addElement(book, 'figure');

    addElement(figure, 'img', 'books__book-img', null, id,
        new Map([
            ['src', item.imageLink],
            ['width', '150'],
            ['height', '220']
        ]
    ));
    let figcaption = addElement(figure, 'figcaption', 'books__book-caption');

    addElement(figcaption, 'p', 'books__book-title', item.title);
    addElement(figcaption, 'p', 'books__book-author', item.author);
    addElement(figcaption, 'p', 'books__book-price', item.price + "$");
    let buttons = addElement(figcaption, 'div', 'books__book-buttons');

    let showLink = addElement(buttons, 'a', 'books__book-info-link', 'Show more', null,
        new Map([
            ['href', '#book-descr'],
            ['title', 'Show book description']
        ]));

    showLink.addEventListener('click', (event) => {
        let popupContainer = document.querySelector('.popup');
        renderDescPopup(popupContainer, item.title, item.author, item.description);
    })

    let addBtn = addElement(buttons, 'button', null, 'Add to bag', null,
        new Map([
            ['title', 'Add to bag']
        ]));

    addBtn.addEventListener('click', (event) => {
        addToCart({ ...item, id });
    });

    container.appendChild(book);
}

const renderMain = function () {
    addElement(main, 'h1', 'books__heading', 'Book Catalog');

    let i = 0;
    fetch('/assets/data/books.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            let bookContainer = addElement(main, 'div', 'books');
            var booksFragment = new DocumentFragment();

            data.forEach(book => renderBook(booksFragment, i++, book));
            bookContainer.appendChild(booksFragment);
        });
}

const renderFooter = function () {

}

renderHeader();
renderMain();
renderFooter();



function renderCartItem(bookItem, value) {
    addElement(bookItem, 'div', 'cart__book-title', `${value.title}`);
    addElement(bookItem, 'div', 'cart__book-author', `${value.author}`);
    addElement(bookItem, 'div', 'cart__book-price', `${value.price}$`);

    const bookCount = addElement(bookItem, 'div', 'cart__book-count');
    const decBtn = addElement(bookCount, 'button', 'cart__book-count-btn', '−', null,
        new Map([
            ['title', 'Remove one']
        ]));
    addElement(bookCount, 'span', 'cart__book-count-value', value.count);
    const incBtn = addElement(bookCount, 'button', 'cart__book-count-btn', '+', null,
        new Map([
            ['title', 'Add one more']
        ]));
    if (value.count == 1) {
        decBtn.disabled = true;
    }

    const removeIco = addElement(bookItem, 'i', 'cart__book-remove fa-solid fa-xmark', null, null,
        new Map([
            ['title', 'Remove from the cart']
        ]));

    decBtn.addEventListener('click', (event) => decBookCountInCart(event));
    incBtn.addEventListener('click', (event) => incBookCountInCart(event));
    removeIco.addEventListener('click', (event) => removeBookFromCart(event));
}

function renderCart(outerContainer) {
    let container = addElement(outerContainer, 'div', 'cart', null, 'cart-popup');

    let wrapper = addElement(container, 'div', 'cart__wrapper', null, 'cart-wrapper');
    addElement(wrapper, 'h2', 'cart__header', 'Shopping cart');

    let booksEncrypted = localStorage.getItem('shoppingCart');
    if (booksEncrypted && booksEncrypted.length > '{}'.length)
    {
        let bookContainer = addElement(wrapper, 'div', 'cart__books', null, 'cart-books');
        let fragment = new DocumentFragment();

        let books = new Map(Object.entries(JSON.parse(booksEncrypted) ?? []));

        let sum = 0;
        books.forEach((book, id) => {
            sum += book.price * book.count;
            let bookItem = document.createElement('div');
            bookItem.id = `${id}-cart-book`;
            bookItem.className = 'cart__book';

            renderCartItem(bookItem, book);
            fragment.appendChild(bookItem);
        });

        bookContainer.appendChild(fragment);

        const total = addElement(wrapper, 'div', 'cart__total-sum', null, 'cart-total');
        total.innerHTML = `<b>Total:</b> ${sum}$`;

        const buttons = addElement(wrapper, 'div', 'cart__buttons')
        addElement(buttons, 'button', 'cart__clear-btn', 'Clear', null,
            new Map([
                ['onclick', 'clearCart()'],
                ['title', 'Clear cart']
            ]));
        addElement(buttons, 'a', 'cart__confirm-btn small', 'Confirm order', null, new Map([
            ['href', '../order-form'],
            ['title', 'Confirm order']
        ]));
    } else {
        addElement(wrapper, 'div', null, 'Cart is empty');
    }
}

function refreshCart() {
    if (!isCartOpen()) return;

    const cartPopup = document.getElementById('cart-popup');

    let cart = localStorage.getItem('shoppingCart');
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));

    const cartBookContainer = document.getElementById('cart-books');
    if (!cartBookContainer) {
        toggleCartOpen();
        return;
    }

    cartBookContainer.childNodes.forEach(book => {
        const bookId = `${parseInt(book.id)}`;
        if (!shoppingCart.get(bookId)) {
            cartBookContainer.removeChild(book);
        }
    });

    let cartSum = 0;
    // for books present in storage
    shoppingCart.forEach((book, id) => {
        cartSum += parseFloat(book.price) * parseInt(book.count);

        // add to book list if not in cart yet
        let bookItem = document.getElementById(`${id}-cart-book`);
        if (!bookItem) {
            bookItem = document.createElement('div');
            bookItem.id = `${id}-cart-book`;
            bookItem.className = 'cart__book';

            renderCartItem(bookItem, book);

            cartBookContainer.appendChild(bookItem);
        } else {
            // update book count if book is in cart
            bookItem.querySelector('.cart__book-count-value').innerHTML = book.count;
        }
    });

    // update total count
    let totalSum = document.getElementById('cart-total');
    totalSum.innerHTML = `<b>Total:</b> ${cartSum}$`;
}

/* Start of cart handling functions */

function addBookToStorage(id, book) {
    let cart = localStorage.getItem('shoppingCart');
    // cart is stored as a stringified Map of id : {...book, count}
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));

    let bookInCart = shoppingCart.get(id);

    if (bookInCart) {
        bookInCart.count++;
    }
    else {
        bookInCart = book;
    }

    shoppingCart.set(id, bookInCart);
    localStorage.setItem('shoppingCart', JSON.stringify(Object.fromEntries(shoppingCart)));

}

function isCartOpen() {
    let cartPopup = document.getElementById('cart-popup');
    return cartPopup !== null;
}

function toggleCartAngleIco() {
    let toggleCartIco = document.getElementById('cart-toggler');
    toggleCartIco.classList.toggle("fa-angle-down");
    toggleCartIco.classList.toggle("fa-angle-up");
}

function toggleCartOpen() {
    toggleCartAngleIco();
    let toggleCartIco = document.getElementById('cart-toggler');
    if (toggleCartIco && toggleCartIco.classList.contains("fa-angle-up")) {
        renderCart(body);
    } else if (isCartOpen()) {
        const cartPopup = document.getElementById('cart-popup');
        body.removeChild(cartPopup);
    }
}

function updateCartSum() {
    let cart = localStorage.getItem('shoppingCart');

    // cart is stored as a stringified Map of id : {...book, count}
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));

    let sum = 0;
    shoppingCart.forEach(book => {
        sum += parseFloat(book.price) * parseInt(book.count);
    });

    // update total sum in header
    let headerCart = document.getElementById('header-cart');
    headerCart.innerHTML = `Total ${sum}$`;

    return sum;
}

/* Add a book to cart by drag and drop */
function drag(ev) {
    let element = ev.target;
    let sibling = element.nextSibling;
    let author = sibling.querySelector('.books__book-author').innerText;
    let title = sibling.querySelector('.books__book-title').innerText;
    let price = parseFloat(sibling.querySelector('.books__book-price').innerText);

    const data = { id: element.id, title, author, price };

    ev.dataTransfer.setData('text', JSON.stringify(data));
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    var parsedData = JSON.parse(data);

    let id = parsedData.id;
    let book = {
        title: parsedData.title,
        author: parsedData.author,
        price: parsedData.price,
        count: 1
    };

    addBookToStorage(id, book);
    updateCartSum();

    refreshCart();
}


/* Add a book to cart by button click */
function addToCart(data) {
    let id = `${data.id}`;
    let book = {
            title: data.title,
            author: data.author,
            price: data.price,
            count: 1
        };


    addBookToStorage(id, book);

    updateCartSum();

    refreshCart();
}


function removeBookFromCart(event) {
    const bookId = `${parseInt(event.target.parentElement.id)}`;

    let cart = localStorage.getItem('shoppingCart');
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));

    shoppingCart.delete(bookId);
    localStorage.setItem('shoppingCart', JSON.stringify(Object.fromEntries(shoppingCart)));

    updateCartSum();

    // if it was the last book, close cart
    if (shoppingCart.size === 0) {
        toggleCartOpen();
    } else {
        refreshCart();
    }
}

function decBookCountInCart(event) {
    const bookId = `${parseInt(event.target.parentElement.parentElement.id)}`;

    let cart = localStorage.getItem('shoppingCart');
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));

    let bookInCart = shoppingCart.get(bookId);

    if (bookInCart) {
        bookInCart.count--;
    }
    else {
        return;
    }

    if (bookInCart.count > 0) {
        shoppingCart.set(bookId, bookInCart);
    } else {
        shoppingCart.delete(bookId);
    }

    localStorage.setItem('shoppingCart', JSON.stringify(Object.fromEntries(shoppingCart)));

    updateCartSum();

    refreshCart();
}

function incBookCountInCart(event) {
    const bookId = `${parseInt(event.target.parentElement.parentElement.id)}`;

    let cart = localStorage.getItem('shoppingCart');
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));

    let bookInCart = shoppingCart.get(bookId);

    if (bookInCart) {
        bookInCart.count++;
    }
    else {
        return;
    }

    shoppingCart.set(bookId, bookInCart);

    localStorage.setItem('shoppingCart', JSON.stringify(Object.fromEntries(shoppingCart)));

    updateCartSum();

    refreshCart();
}

function clearCart() {
    localStorage.removeItem('shoppingCart');
    updateCartSum();

    toggleCartOpen();
}

/* End of cart handling functions */
