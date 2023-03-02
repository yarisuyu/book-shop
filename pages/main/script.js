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
    let descTitle = addElement(descHeader, 'h2', 'popup__title', header);

    let close = addElement(descHeader, 'a', 'close', 'x', null, new Map(['href', '#']));
    let descAuthor = addElement(descContainer, 'h3', 'popup__author', author);
    let descText = addElement(descContainer, 'p', 'popup__description', description);
}

const renderHeader = function () {
    let wrapper = addElement(header, 'div','wrapper');
    let icon = addElement(wrapper, 'div', 'header__ico', 'BookShop');

    let bag = document.createElement('div');
    bag.className = 'header__bag';

    let bagIco = addElement(bag, 'img', 'header__bag-ico', null, null,
        new Map([
            ['src', '../../assets/icons/bag-ico.png'],
            ['ondrop', 'drop(event)'],
            ['ondragover', 'allowDrop(event)']
        ]));

    bag.append(bagIco);

    let bagSum = addElement(bag, 'div', 'cart__sum');

    wrapper.append(bag);
}

const renderBook = function (container, id, item) {
    let book = addElement(container, 'div', null, null,
        new Map([
            ['draggable', true],
            ['ondragstart', 'drag(event)']
        ]
        ));

    let figure = document.createElement('figure');
    book.append(figure);

    let img = addElement(figure, 'img', 'books__book-img', null, id,
        new Map([
            ['src', item.imageLink],
            ['width', '150'],
            ['height', '220']
        ]
    ));
    let figcaption = document.createElement('figcaption');
    figcaption.className = 'books__book-caption';
    figure.append(figcaption);

    let bookName = addElement(figcaption, 'p', 'books__book-title', item.title);
    let bookAuthor = addElement(figcaption, 'p', 'books__book-author', item.author);
    let bookPrice = addElement(figcaption, 'p', 'books__book-price', item.price + "$");
    let buttons = addElement(figcaption, 'div', 'books__book-buttons');

    let showLink = addElement(buttons, 'a', 'books__book-info-link', 'Show more', null,
        new Map([['href', '#book-descr']]));

    showLink.addEventListener('click', (event) => {
        let popupContainer = document.querySelector('.popup');
        renderDescPopup(popupContainer, item.title, item.author, item.description);
    })

    let addBtn = document.createElement('button');
    addBtn.innerText = 'Add to bag';

    addBtn.addEventListener('click', (event) => {
        console.log(event);
        console.log(item);
        addToCart({ ...item, id });
    });
    buttons.append(addBtn);
}

const renderMain = function () {
    let heading = addElement(main, 'h1', 'books__heading', 'Book Catalog');

    let i = 0;
    fetch('http://127.0.0.1:5500/assets/data/books.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            let bookContainer = addElement (main, 'div', 'books');
            data.forEach(book => renderBook(bookContainer, i++, book));
        });
}

const renderFooter = function () {

}

renderHeader();
renderMain();
renderFooter();


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

    let sum = +localStorage.getItem('shoppingCartSum');
    sum += +book.price;
    localStorage.setItem('shoppingCartSum', sum);
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

    let sum = +localStorage.getItem('shoppingCartSum');
    sum += +book.price;
    localStorage.setItem('shoppingCartSum', sum);

    // add cart item count
    let bag = document.querySelector('.header__bag');

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