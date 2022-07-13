let pageCount = 1;
const URL = 'https://api.github.com/';

const cardContainer = document.querySelector('#user-card');
const searchBut = document.querySelector('#searchUsers');
const uploadUser = document.querySelector('#uploadUser');
const listUsers = document.querySelector('.listUsers');

let selectedUser;

searchBut.addEventListener('input',() => {
    clearListUsers();
    clearCardUser();
    clearUploadBut()
    listUsers.append(loadText('loadText'));
});
searchBut.addEventListener('input',
    debounce(function (){
        let Users = searchBut.value;
        getUser(Users,1).then(users => createUsers(users));
    },1000));

uploadUser.addEventListener('click',
        function (){
            let Users = searchBut.value;
            getUser(Users,pageCount).then(users => createUsers(users,true));
})

listUsers.addEventListener('click', function (event) {
    let target = event.target.closest('li')
    if (!listUsers.contains(target)) return
    clickCardUser(target)
})

let userClick;
function clickCardUser(elem){
    if (userClick){
        userClick.className = 'listUsers_item' ;
    }
    userClick = elem;
        elem.className = 'listUsers_item listUsers_item_Click';

}

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

async function getUser(searchValue, page) {
        try {
            if (searchValue.trim()){
                return await fetch(`${URL}search/users?q=${searchValue}&per_page=20&page=${page}`);
            }
        }catch (e){
            messageCountUsersOrError(0,e);
            clearListUsers()
            return false;
        }

}

function createUsers(users, update = false){
    const listUsers = document.querySelector('#listUsers__users');
        if (users?.ok){
            try {
                if (!update){
                    clearListUsers()
                    clearUploadBut()
                    clearCardUser()
                    pageCount = 1;
                }
                users.json().then((user) => {
                    if (user.items){
                        user.items.forEach(user => listUsers.append(createUserCard(user)));
                        pageCount++;
                    }
                    else {
                        clearListUsers()
                        clearUploadBut()
                        clearCardUser()
                        pageCount = 1;
                    }
                    messageCountUsersOrError(user.total_count);
                    uploadButVisHide(user.total_count);
                });

            }catch (e){
                console.log(e);
                messageCountUsersOrError(0,e);
            }
        }
        else if (users !== false){
            listUsers.innerHTML = '';
            messageCountUsersOrError(0,1)
        }
        else {
            messageCountUsersOrError(0,users.status);
        }

}

function uploadButVisHide(users){
    const uploadBut = document.querySelector('#uploadUser');
    uploadBut.className = (users >= 20) ? 'uploadUser uploadUserVis' : 'uploadUser uploadUserHide';
}

function messageCountUsersOrError(users,error) {
    let message = document.querySelector('#message');
    message.className = '';
    if (users){
        message.textContent = (users > 4 ) ? `Найдено ${users} пользователей` :
            (users > 1) ? `Найдено ${users} пользователя` : 'Найден 1 пользователь';
    }else if(users === 0){
        message.textContent = 'По вашему запросу пользователей не найдено'
    }
    if (error){
        message.className = 'error';
        message.textContent = (error === 403) ? 'Слишком частые запросы! Немного подождите' :
           'Пустая строка!'
    }
}


function clearListUsers(){
    const listUsers = document.querySelector('#listUsers__users');
    listUsers.innerHTML = '';
}
function clearCardUser(){
    const cardUser = document.querySelector('#user-card');
    cardUser.innerHTML = '';
}
function clearUploadBut(){
    const uploadBut = document.querySelector('#uploadUser');
    uploadBut.className = 'uploadUser uploadUserHide';
}

function createUserCard(user){
    const elem = document.createElement('li');
    elem.className = 'listUsers_item'
    elem.addEventListener('click', () => detailedUserCard(user,elem));
    elem.innerHTML = `<img class="user-prev-photo" src="${user.avatar_url}" alt="${user.login}_photo">
                      <p class="user-prev-name">${user.login}</p>`;
    return elem;
}

function loadText(className){
        const load = document.createElement('p');
        load.className = className;
        load.innerHTML = 'Загрузка...';
        return load;
}



function detailedUserCard(user){
    selectedUser = user
    clearCardUser()
    cardContainer.innerHTML = ''
    createCard(user)
    loadFollowingUser(user.login).then(data => {
        const followingHTML = getUserListHTML(data, 'Following',user);
        createItemsCard(user, followingHTML)
    })
    loadFollowersUser(user.login).then(data => {
        const followersHTML = getUserListHTML(data, 'Followers',user);
        createItemsCard(user, followersHTML)
    })
    loadReposUser(user.login).then(data => {
        const reposHTML = getUserListHTML(data, 'Repos',user);
        createItemsCard(user, reposHTML)
    })

}


function createCard(user){

    const card = document.createElement('div');
    card.className = 'containerCard'

    card.innerHTML = `<img class="image-user" src="${user.avatar_url}">
                                  <h2 class="user-name">${user.login}</h2>`;

    cardContainer.append(card);
}

function createItemsCard(user,data){
    const card = document.createElement('div');
    card.innerHTML = `${data}`;

    cardContainer.append(card);
}


function getUserListHTML(data, title) {
    if (data === undefined){
        const res =  `<div class="user-block" >
                                  <h3 class="user-block-title">${title}</h3>
                                  <ul class="user-list" id="${title}1">
                                    <li><p class="error">ОШИБКА</p></li>
                                    <li><button class="uploadUser" id="${title}"> Обновить</button></li>
                                  </ul>
                              </div>`
            ;

        return res;
    }else {
        return data.length ? `<div class="user-block" >
                                  <h3 class="user-block-title">${title}</h3>
                                  <ul class="user-list" id="${title}">${this.templateItem(data)}</ul>
                              </div>`
            : '';
    }
}

cardContainer.addEventListener('click', function (event) {
    let but = event.target.closest('button')
    if (!cardContainer.contains(but)) return;
    if (but.id === 'Following')
        updateFollowing(selectedUser, but.id)
    if (but.id === 'Followers')
        updateFollowers(selectedUser, but.id)
    if (but.id === 'Repos')
        updateRepos(selectedUser, but.id)
})

function updateFollowing(user,ID){
    const search = `#${ID}1`
    const dataUp = document.querySelector(search)

    loadFollowingUser(user.login).then(data => {
        if (data) {
            dataUp.innerHTML = ''
            dataUp.innerHTML = templateItem(data)
        }
    })
}
function updateFollowers(user,ID){
    const search = `#${ID}1`
    const dataUp = document.querySelector(search)

    loadFollowersUser(user.login).then(data => {
        if (data) {
            dataUp.innerHTML = ''
            dataUp.innerHTML = templateItem(data)
        }
    })
}
function updateRepos(user,ID){
    const search = `#${ID}1`
    const dataUp = document.querySelector(search)

    loadReposUser(user.login).then(data => {
        if (data) {
            dataUp.innerHTML = ''
            dataUp.innerHTML = templateItem(data)
        }
    })
}

function templateItem(data) {
    let userItem = '';
    data.forEach(user => {
        userItem += `<li class="user-list-item">
                            <a href="${user.html_url}" class="user-list-link">${user.login ? user.login : user.name}</a>
                          </li>`;
    });
    return userItem
}

async function loadFollowingUser (user){
    return await loadUserData(`${URL}users/${user}/following`)
}
function loadFollowersUser (user){
    return loadUserData(`${URL}users/${user}/followers`)
}
function loadReposUser (user){
    return loadUserData(`${URL}users/${user}/repos`)
}

async function loadUserData(data) {
    try {
        return (await fetch(data)).json()
    }catch (e){
        console.log(e);
        //messageCountUsersOrError(0,e);
    }

}
