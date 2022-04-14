let pageCount = 1;
const URL = 'https://api.github.com/';

// const searchBut = document.querySelector('#searchUsers')
//     .addEventListener('input',
//         function (){
//             let Users = document.querySelector('#searchUsers').value;
//             getUser(Users,1).then(users => createUsers(users));
//         })

const searchBut = document.querySelector('#searchBut')
    .addEventListener('click',
        function (){
        let Users = document.querySelector('#searchUsers').value;
            getUser(Users,1).then(users => createUsers(users));
        })
const uploadUser = document.querySelector('#uploadUser')
    .addEventListener('click',
        function (){
            let Users = document.querySelector('#searchUsers').value;
            getUser(Users,pageCount).then(users => createUsers(users,true));
})

async function getUser(searchValue, page) : void{
    if (searchValue){
        return await fetch(`${URL}search/users?q=${searchValue}&per_page=20&page=${page}`);
    }
}

function createUsers(users, update = false): void{
    const listUsers = document.querySelector('#listUsers__users');
    const uploadBut = document.querySelector('#uploadUser');
    let userClone
    let countUser


    uploadBut.className = users ? 'uploadUser uploadUserVis' : 'uploadUser uploadUserHide';

    try {
        if (!update){
            listUsers.innerHTML = '';
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
                listUsers.innerHTML = '';
                pageCount = 1;
            }
            countUsersMessage(countUser);
        });
    }catch (e){
        console.log(e)
    }
}

function countUsersMessage(users): void {
    let countUsers = document.querySelector('#countUsers');
    countUsers.textContent = (users > 0) ? `Найдено ${users} пользователей` : 'По вашему запросу пользователей не найдено';
}

function createUserCard(user): void{
    const elem = document.createElement('li');
    elem.className = 'listUsers_item'
    elem.addEventListener('click', () => detailedUserCard(user));
    elem.innerHTML = `<img class="user-prev-photo" src="${user.avatar_url}" alt="${user.login}_photo">
                      <p class="user-prev-name">${user.login}</p>`;
    return elem;
}

function detailedUserCard(user): void{
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    const CardContainer = document.querySelector('#userCard');
    const card = document.createElement('div');

    loadUserData(user.login).then(data => {
        const [following, followers, repos] = data;
        const followingHTML = getUserListHTML(following, 'Following');
        const followersHTML = getUserListHTML(followers, 'Followers');
        const reposHTML = getUserListHTML(repos, 'Repos');
        card.innerHTML = `<img src="${user.avatar_url}">
                                  <h2 class="user-name">${user.login}</h2>
                                     ${followingHTML}
                                     ${followersHTML}
                                     ${reposHTML}`;
        if (CardContainer){
            CardContainer.innerHTML = '';
        }
        CardContainer.append(card);
    })
}
function getUserListHTML(data, title): void {
    return data.length ? `<div class="user-block">
                                  <h3 class="user-block-title">${title}</h3>
                                  <ul class="user-list">${this.templateItem(data)}</ul>
                              </div>`
        : '';
}

function templateItem(data): void {
    let userItem = '';
    data.forEach(user => {
        userItem += `<li class="user-list-item">
                            <a href="${user.html_url}" class="user-list-link">${user.login ? user.login : user.name}</a>
                          </li>`;
    });
    return userItem
}

async function loadUserData(user) : void{
    const urls = [
        `${URL}users/${user}/following`,
        `${URL}users/${user}/followers`,
        `${URL}users/${user}/repos`,
    ];
    const requests = urls.map(url => fetch(url));
    return Promise.all(requests)
        .then(responses => Promise.all(responses.map(r => r.json())))
}
