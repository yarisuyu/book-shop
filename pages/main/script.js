
let body = document.querySelector("body");

let popupContainer = document.createElement('div');
popupContainer.className = 'popup';
popupContainer.id = 'book-descr';
body.append(popupContainer);

let header = document.createElement('header');
header.className = "header";
let main = document.createElement('main');
let footer = document.createElement('footer');
footer.className = "footer";

body.append(header);
body.append(main);
body.append(footer);

const renderDescPopup = function(container, header, author, description) {
    let descContainer = document.createElement('div');
    descContainer.className = 'popup__content';
    container.append(descContainer);

    let descHeader = document.createElement('div');
    descHeader.className = 'popup__header';
    descContainer.append(descHeader);

    let descTitle = document.createElement('h2');
    descTitle.className = 'popup__title';
    descTitle.innerText = header;
    descHeader.append(descTitle);

    let close = document.createElement('a');
    close.href = '#';
    close.className = 'close';
    close.innerText = 'x';
    descHeader.append(close);

    let descAuthor = document.createElement('h3');
    descAuthor.className = 'popup__author';
    descAuthor.innerText = author;
    descContainer.append(descAuthor);

    let descText = document.createElement('p');
    descText.className = 'popup__description';
    descText.innerText = description;
    descContainer.append(descText);
}

const renderHeader = function () {
    let wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    header.append(wrapper);

    let icon = document.createElement('div');
    icon.className = 'header__ico';
    icon.innerHTML = 'BookShop';
    wrapper.append(icon);

    let bag = document.createElement('div');
    bag.className = 'header__bag';

    let bagIco = document.createElement('img');
    bagIco.className = 'header__bag-ico';
    bagIco.setAttribute('src', '../../assets/icons/bag-ico.png');
    bagIco.setAttribute('ondrop', 'drop(event)');
    bagIco.setAttribute('ondragover', 'allowDrop(event)');
    bag.append(bagIco);

    wrapper.append(bag);
}

const renderBook = function(container, id, item) {
    let book = document.createElement('div');
    book.setAttribute('draggable', true);
    book.setAttribute('ondragstart', 'drag(event)');
    book.id = id;

    let figure = document.createElement('figure');
    let img = document.createElement('img');
    img.setAttribute('src', item.imageLink);
    img.className = 'books__book-img';
    img.setAttribute('width', '150');
    img.setAttribute('height', '220');

    figure.append(img);
    let figcaption = document.createElement('figcaption');
    figcaption.className = 'books__book-caption';

    let bookName = document.createElement('p');
    bookName.innerText = item.title;
    bookName.className = 'books__book-title';
    figcaption.append(bookName);

    let bookAuthor = document.createElement('p');
    bookAuthor.innerText = item.author;
    bookAuthor.className = 'books__book-author';
    figcaption.append(bookAuthor);

    let bookPrice = document.createElement('p');
    bookPrice.innerText = item.price + "$";
    bookPrice.className = 'books__book-price';
    figcaption.append(bookPrice);

    let buttons = document.createElement('div');
    buttons.className = 'books__book-buttons';

    let showLink = document.createElement('a');
    showLink.innerText = 'Show more';
    showLink.href = '#book-descr';
    showLink.className = 'books__book-info-link';
    buttons.append(showLink);

    showLink.addEventListener('click', (event) => {
        console.log(event);
        console.log(item.description);

        let popupContainer = document.querySelector('.popup');

        renderDescPopup(popupContainer, item.title, item.author, item.description);

    })

    let addBtn = document.createElement('button');
    addBtn.innerText = 'Add to bag';

    addBtn.addEventListener('click', (event) => {
        console.log(event);
        console.log(item);
        addToCart(item);
    });
    buttons.append(addBtn);

    figcaption.append(buttons);
    figure.append(figcaption);
    book.append(figure);
    container.append(book);
}

const renderMain = function () {
    let heading = document.createElement('h1');
    heading.innerText = 'Book Catalog';
    heading.className = 'books__heading';
    main.append(heading);
    let i = 0;

    fetch('http://127.0.0.1:5500/assets/data/books.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);

            let bookContainer = document.createElement('div');
            bookContainer.className = 'books';
            main.append(bookContainer);

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

    const data = { title, author, price }
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
    let shoppingCart = new Set(JSON.parse(cart) ?? []);
    console.log(shoppingCart);
    shoppingCart.add(JSON.stringify(parsedData));
    localStorage.setItem('shoppingCart', JSON.stringify(Array.from(shoppingCart)));
}

function addToCart(book) {
    console.log(book);
    let cart = localStorage.getItem('shoppingCart');
    console.log(cart);
    let shoppingCart = new Set(JSON.parse(cart) ?? []);
    console.log(shoppingCart);
    let data = {
        title: book.title,
        author: book.author,
        price: book.price
    };
    console.log(data);
    shoppingCart.add(JSON.stringify(data));
    localStorage.setItem('shoppingCart', JSON.stringify(Array.from(shoppingCart)));
}