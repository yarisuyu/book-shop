console.log("Here we go!");


const body = document.querySelector("body");

console.log(body);

let header = document.createElement('header');
let main = document.createElement('main');
let footer = document.createElement('footer');

body.append(header);
body.append(main);
body.append(footer);

let heading = document.createElement('h1');
heading.innerText = 'Book Catalog';
heading.className = 'books__heading';
main.append(heading);

const renderBook = function(container, item) {
    let book = document.createElement('div');

    let figure = document.createElement('figure');
    let img = document.createElement('img');
    img.setAttribute('src', item.imageLink);
    img.className = 'books__book-img';
    img.setAttribute('width', '200');
    img.setAttribute('height', '260');
    console.log(img);

    figure.append(img);
    let figcaption = document.createElement('figcaption');
    figcaption.className = 'books__book-caption';

    let bookName = document.createElement('p');
    bookName.innerText = item.title;
    bookName.className = 'books__book-name';
    figcaption.append(bookName);

    let bookAuthor = document.createElement('p');
    bookAuthor.innerText = item.author;
    bookAuthor.className = 'books__book-author';
    figcaption.append(bookAuthor);

    let bookPrice = document.createElement('p');
    bookPrice.innerText = item.price + "$";
    bookPrice.className = 'books__book-price';
    figcaption.append(bookPrice);

    let showLink = document.createElement('a');
    showLink.innerText = 'Show more';
    showLink.className = 'books__book-info-link';
    figcaption.append(showLink);

    let addBtn = document.createElement('button');
    addBtn.innerText = 'Add to bag';
    figcaption.append(addBtn);

    figure.append(figcaption);
    console.log(figure);

    book.append(figure);
    console.log(book);
    container.append(book);
}

fetch('http://127.0.0.1:5500/assets/data/books.json') //path to the file with json data
    .then(response => {
        return response.json();
    })
    .then(data => {
        console.log(data);

        let bookContainer = document.createElement('div');
        bookContainer.className = 'books';
        main.append(bookContainer);

        data.forEach(book => renderBook(bookContainer, book));
    });