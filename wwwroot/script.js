let allBooks = [];
const pageSize = 6;
let currentPage = 1;
const addBookBtn = document.getElementById('addBookBtn');
if(addBookBtn){
    const checkAuthorsBtn = document.getElementById('chekAuthorsBtn')
    checkAuthors(addBookBtn, checkAuthorsBtn);
} 

const booksList = document.getElementById('booksList');
if(booksList){
    loadBooksList();
}
const authorList = document.getElementById('authorList');
if(authorList){
    loadAuthorList();
}

async function loadAuthorList() {
    const response = await fetch('/getAuthorList');
    let allAuthors = await response.json();
    renderAuthorsList(allAuthors);
}
async function goToAuthor(){
    const authorId = document.getElementById('searchAuthorForId').value;
    document.getElementById('searchAuthorForId').value = '';
    const response = await fetch('/getAuthorListById', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({Request: authorId})
    });
    const authorList = await response.json();
    renderAuthorsList(authorList);
}
function renderAuthorsList(allAuthors) {
    const container = document.getElementById('authorList');
    if (!container) return;
    container.innerHTML = '';

    for(const author of allAuthors){
        let booksHtml = '';
        for (const book of author.books) {
            booksHtml += `${book.title}, `;
        }
    booksHtml = booksHtml.slice(0, -2);
        container.innerHTML += 
            `<li>
                <b>Автор: ${author.name}</b>
                <blockquote>Уникальный ID: ${author.id}</blockquote>
                <blockquote>Книги: ${booksHtml || 'Этот автор не пока еще ничего не опубликовал'}</blockquote>
            </li>`;
    }   
}

async function checkAuthors(addBookButton, checkAuthorsButton) {
    const response = await fetch('/getAmountOfAuthors');
    const authorsAmount = await response.json();
    if (authorsAmount !== 0) {
        addBookButton.disabled = false;
        checkAuthorsButton.disabled = false;
    }
}

async function loadBooksList() {
    const response = await fetch('/getBooksList');
    allBooks = await response.json();
    currentPage = 1;
    renderCurrentPage();
}
function goToPage(){
    const willGoToPageNumber = document.getElementById('willGoToPageNumber').value;
    document.getElementById('willGoToPageNumber').value = '';
    const totalPages = Math.ceil(allBooks.length / pageSize);
    if(willGoToPageNumber <= totalPages && willGoToPageNumber > 0){
        currentPage = willGoToPageNumber;
        renderCurrentPage();
    }
    else{
        return;
    }
}

function renderCurrentPage(){
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const booksListForRender = allBooks.slice(start, end); 
    let totalPages = Math.ceil(allBooks.length / pageSize);
    if(totalPages === 0){
        totalPages = "Книги отсутствуют"
    }
    document.getElementById('totalPagesInfo').innerText = `общее количество страниц: ${totalPages}`;

    renderBooksList(booksListForRender);

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = end >= allBooks.length;
    pageInfo.innerText = `Страница ${currentPage}`;

}
function nextPage() {
    currentPage++;
    renderCurrentPage();
}

function prevPage() {
    currentPage--;
    renderCurrentPage();
}
function renderBooksList(books) {
    const container = document.getElementById('booksList');
    if (!container) return;
    
    container.innerHTML = '';
    if(books.length == 0){
        container.innerHTML +=`
          <span>Список книг пуст</span>
        `
    }
    else{
        for (const book of books) {
            container.innerHTML += `
                <li>
                    <b>Название: ${book.title}</b>
                    <button data-id="${book.id}" onclick="deleteBook(this)">Удалить Книгу</button>
                    <button data-id="${book.id}" onclick="window.location.href='editBook.html?id=${book.id}'">Редактировать Книгу</button>
                    <blockquote>Автор: ${book.author.name}</blockquote>
                </li>
            `;
        }
    }
}
async function editBook(){
    const newNameInput = document.getElementById('newNameInput').value;
    const sendNewDataToServerBtn = document.getElementById('sendDataToServerBtn');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log(newNameInput, id);
    const response = await fetch('/editBook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            NewName: newNameInput,
            Id: id
        })
    })
    const text = await response.text();
    console.log(text);
    window.location.href='bookList.html';
}
async function deleteBook(button){
    const btnId = button.getAttribute('data-id');
    const response = await fetch(`/deleteBook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({Request: btnId})
    });
    const logText = await response.text();
    console.log(logText);
    loadBooksList();
}
function checkLentgh(input){
    const inputValue = input.value;
    const sendDataButton = document.getElementById('sendDataToServerBtn');
    if(inputValue.length > 0){
        sendDataButton.disabled = false;
    }
    else{
        sendDataButton.disabled = true;
    }
}
async function addBookPass(){
    const authorID = document.getElementById('inputAuthorID').value;
    const bookTitle = document.getElementById('inputBookTitle').value;
    const sendDataButton = document.getElementById('sendDataToServerBtn');
    const response = await fetch(`/authorIsExists?id=${authorID}`);
    const exists = await response.json();
    console.log(exists);
    if(exists && bookTitle.length > 0){
        sendDataButton.disabled = false;
    }
    else{
        sendDataButton.disabled = true;
    }
    
} 
async function sendAuthorDataToServer(){
    const nameData = document.getElementById('inputAuthorName').value;
    document.getElementById('inputAuthorName').value = '';
    const response = await fetch('/addAuthors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({name: nameData})
    })
    const text = await response.text();
    const ifAdded = document.getElementById('ifAdded');
    ifAdded.innerText = text;
}
async function sendBookDataToServer() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const authorID = document.getElementById('inputAuthorID').value;
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputAuthorID').value = '';
    const ifAdded = document.getElementById('ifAdded');
    const response = await fetch('/addBooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
            title: bookTitle,
            authorId: authorID
        })
    })
    const text = await response.text();
    ifAdded.innerText = text;
}