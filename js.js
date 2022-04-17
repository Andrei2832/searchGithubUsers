let pageCount = 1;
const URL = 'https://api.github.com/';

const searchBut = document.querySelector('#searchUsers');
searchBut.addEventListener('input',() => {
    clearAll(1,1,1);
    const container = document.querySelector('.listUsers');
    container.append(loadText('loadText'));
});
searchBut.addEventListener('input',
    debounce(function (){
        let Users = document.querySelector('#searchUsers').value;
        getUser(Users,1).then(users => createUsers(users));
    },1000));


const uploadUser = document.querySelector('#uploadUser');
    uploadUser.addEventListener('click',
        function (){
            let Users = document.querySelector('#searchUsers').value;
            getUser(Users,pageCount).then(users => createUsers(users,true));
})

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
            console.log(e);
            messageCountUsersOrError(0,e);
            clearAll(1)
            return false;
        }

}


function createUsers(users, update = false){
    const listUsers = document.querySelector('#listUsers__users');
    if (users){
        if (users.ok){
            let userClone;
            let countUser = 0;

            try {
                if (!update){
                    clearAll(1,1,1);
                    pageCount = 1;
                }
                users.json().then((user) => {
                    if (user.items){
                        userClone = user.items;
                        countUser = user.total_count;
                        userClone.forEach(user => listUsers.append(createUserCard(user)));
                        pageCount++;
                    }
                    else {
                        clearAll(1,1,1);
                        pageCount = 1;
                    }
                    messageCountUsersOrError(countUser);
                    uploadButVisHide(countUser);
                });

            }catch (e){
                console.log(e);
                messageCountUsersOrError(0,e);
            }
        }else {
            messageCountUsersOrError(0,users.status);
        }
    }else if (users !== false){
        console.log(users)
        listUsers.innerHTML = '';
        messageCountUsersOrError(0,1)
    }
}

function uploadButVisHide(users){
    const uploadBut = document.querySelector('#uploadUser');
    uploadBut.className = (users >= 20) ? 'uploadUser uploadUserVis' : 'uploadUser uploadUserHide';
}

function messageCountUsersOrError(users,error) {
        console.log(error)
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
            (error === 1) ? 'Пустая строка!' :'Неизвестная ошибка! Перезагрузите страницу!'
    }
}

function clearAll(listUsersClear,cardUserClear,uploadButClear){
    if (listUsersClear){
        const listUsers = document.querySelector('#listUsers__users');
        listUsers.innerHTML = '';
    }
    if (cardUserClear){
        const cardUser = document.querySelector('#user-card');
        cardUser.innerHTML = '';
    }
    if (uploadButClear){
        const uploadBut = document.querySelector('#uploadUser');
        uploadBut.className = 'uploadUser uploadUserHide';
    }
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

let userClick = '';
function clickCardUser(elem){
    if (userClick === ''){
        elem.className = 'listUsers_item listUsers_item_Click';
        userClick = elem;
    }else {
        userClick.className = 'listUsers_item';
        elem.className = 'listUsers_item listUsers_item_Click';
        userClick = elem;
    }
}

function detailedUserCard(user,elem){
    clearAll(0,1,0)
    clickCardUser(elem);

    const cardContainer = document.querySelector('#user-card');
    cardContainer.append(loadText('loadText'));

    const card = document.createElement('div');
    card.className = 'containerCard'
    loadUserData(user.login).then(data => {
        const [following, followers, repos] = data;
        const followingHTML = getUserListHTML(following, 'Following');
        const followersHTML = getUserListHTML(followers, 'Followers');
        const reposHTML = getUserListHTML(repos, 'Repos');
        card.innerHTML = `<img class="image-user" src="${user.avatar_url}">
                                  <h2 class="user-name">${user.login}</h2>
                                     ${followingHTML}
                                     ${followersHTML}
                                     ${reposHTML}`;
        if (cardContainer){
            cardContainer.innerHTML = '';
        }
        cardContainer.append(card);
        addClickUpdateData(user,'#butFollowing','#Following');
        addClickUpdateData(user,'#butFollowers','#Followers',);
        addClickUpdateData(user,'#butRepos','#Repos',);
    })

}
function getUserListHTML(data, title) {
    return data.length ? `<div class="user-block" >
                                  <h3 class="user-block-title">${title}</h3>
                                  <button class="refresh-data" id="but${title}">обновить</button>
                                  <ul class="user-list" id="${title}">${this.templateItem(data)}</ul>
                              </div>`
        : '';
}

function addClickUpdateData(user,butClick,ID){
    const updateDataBut = document.querySelector(butClick);
    if (updateDataBut){
        updateDataBut.addEventListener('click',function (){
            const dataUpdate = document.querySelector(ID);
            dataUpdate.innerHTML = "";
            dataUpdate.append(loadText('loadTextMini'));
            if (ID === '#Following'){
                loadUserData(user.login,1,0,0).then(data =>{
                    const [dataText] = data;
                    dataUpdate.innerHTML = templateItem(dataText);
                })
            }
            if (ID === '#Followers'){
                loadUserData(user.login,0,1,0).then(data =>{
                    const [dataText] = data;
                    dataUpdate.innerHTML = templateItem(dataText);
                })
            }
            if (ID === '#Repos'){
                loadUserData(user.login,0,0,1).then(data =>{
                    const [dataText] = data;
                    dataUpdate.innerHTML = templateItem(dataText);
                })
            }
        });
    }
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

async function loadUserData(user, followingTrue = 1,followersTrue= 1,reposTrue= 1) {
    const urls = [];
    try {
        if (followingTrue){
            urls.push(`${URL}users/${user}/following`);
        }
        if (followersTrue){
            urls.push(`${URL}users/${user}/followers`);
        }
        if (reposTrue){
            urls.push(`${URL}users/${user}/repos`);
        }
        const requests = urls.map(url => fetch(url));

        urls.map(url => fetch(url).then(data => {
            let check = data.status;
            if (check !== 200){
                messageCountUsersOrError(0,check);
            }
        }));

        return await Promise.all(requests)
            .then(responses => Promise.all(responses.map(r => r.json())))
    }catch (e){
        console.log(e);
        messageCountUsersOrError(0,e);
    }

}
