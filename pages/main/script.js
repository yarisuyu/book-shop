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
            ['src', '/']
        ]));

    addElement(wrapper, 'div', 'header__motto', 'Books build a stairway to your imagination')

    let bag = addElement(wrapper, 'div', 'header__bag', null, null,
        new Map([
            ['ondrop', 'drop(event)'],
            ['ondragover', 'allowDrop(event)']
        ]));

    //<i class="fa-solid fa-cart-shopping"></i> empty cart
    addElement(bag, 'i', 'header__bag-ico fa-solid fa-cart-shopping');

    addElement(bag, 'span', 'header__bag-sum', ' 0$ ', 'header-cart');
    addElement(bag, 'i', 'header__bag-show-ico fa-solid fa-angle-down', null, null,
        new Map([
            ['onclick', 'showCart(event)']
        ]));
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
        new Map([['href', '#book-descr']]));

    showLink.addEventListener('click', (event) => {
        let popupContainer = document.querySelector('.popup');
        renderDescPopup(popupContainer, item.title, item.author, item.description);
    })

    let addBtn = addElement(buttons, 'button', null, 'Add to bag');

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

function updateCartSum(price) {
    let sum = +localStorage.getItem('shoppingCartSum');
    sum += price;
    localStorage.setItem('shoppingCartSum', sum);

    let headerCart = document.getElementById('header-cart');
    headerCart.innerText = `Total ${sum}$`;
}


function drag(ev) {
    console.log('Drag: ');
    console.log(ev);

    let element = ev.target;

    console.log(element.parentElement.parentElement.id);
    let sibling = element.nextSibling;
    let author = sibling.querySelector('.books__book-author').innerText;
    let title = sibling.querySelector('.books__book-title').innerText;
    let price = sibling.querySelector('.books__book-price').innerText;

    const data = { id, title, author, price }
    console.log(data);

    ev.dataTransfer.setData('text', JSON.stringify(data));
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData('text');
    console.log('Dropped: ');

    var parsedData = JSON.parse(data);
    console.log(parsedData);

    let cart = localStorage.getItem('shoppingCart');
    console.log(cart);
    // cart is stored as a stringified Map of id : {...book, count}
    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));
    console.log(shoppingCart);

    // if cart contains this book, increment count
    let id = parsedData.id;
    let book = shoppingCart[id];
    if (book) {
        book.count++;
    }
    else {
        book = {
            title: parsedData.title,
            author: parsedData.author,
            price: parsedData.price,
            count: 1
        };
    }

    shoppingCart.set(id, book);
    console.log(JSON.stringify(Object.fromEntries(shoppingCart)));
    localStorage.setItem('shoppingCart', JSON.stringify(Object.fromEntries(shoppingCart)));

    updateCartSum(+book.price);
}

function addToCart(data) {
    console.log(data);
    let cart = localStorage.getItem('shoppingCart');
    console.log(cart);

    let shoppingCart = new Map(Object.entries(JSON.parse(cart) ?? []));
    console.log(shoppingCart);

    let id = `${data.id}`;
    let book = shoppingCart.get(id);
    if (book) {
        book.count = book.count + 1;
        console.log(book.count);
    }
    else {
        book = {
            title: data.title,
            author: data.author,
            price: data.price,
            count: 1
        };
    }
    console.log(book);
    shoppingCart.set(id, book);
    console.log(shoppingCart);
    console.log(Object.fromEntries(shoppingCart));

    console.log(JSON.stringify(Object.fromEntries(shoppingCart)));
    localStorage.setItem('shoppingCart', JSON.stringify(Object.fromEntries(shoppingCart)));

    updateCartSum(+book.price);

}

function openCart() {
    document.getElementById("cart-popup").style.display = "block";
}

function closeCart() {
    document.getElementById("cart-popup").style.display = "none";
}

function renderCart(outerContainer) {
    let container = addElement(outerContainer, 'div', 'cart', null, 'cart-popup');

    let form = addElement(container, 'form', 'cart__form');
    let header = addElement(form, 'h2', 'cart__header', 'Shopping cart');
    let bookContainer = addElement(form, 'div', 'cart__books');

    let booksEncrypted = localStorage.getItem('shoppingCart');
    let books = new Map(Object.entries(JSON.parse(booksEncrypted) ?? []));

    Object.values(books).forEach(value => {
        addElement(bookContainer, 'div', 'cart__book-title', `${value.title}`);
        addElement(bookContainer, 'div', 'cart__book-author',`${value.author}`);
        addElement(bookContainer, 'div', 'cart__book-price', `${value.price}`);
        addElement(bookContainer, 'a', 'cart__book-close','x', null, new Map(['onclick', 'onRemove(ev)']));
    })

    let totalSum = localStorage.getItem('shoppingCartSum');

    addElement(form, 'div', 'cart__total-sum', totalSum + '$' );
    addElement(form, 'button', 'cart__confirm-btn', 'Confirm order', null, new Map(['onclick', 'onCheckout()']))
    addElement(form, 'button', 'cart__close-btn', 'Close', null, new Map(['onclick', 'closeCart()']))

}