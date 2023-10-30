
let db;
const template = {};
const form = document.querySelector("#todo-form")
const container = document.querySelector("#todo-body")


if (localStorage.getItem("db")) {
    const data = localStorage.getItem("db")
    try {
        db = new Map(JSON.parse(data));
    } catch {
        db = new Map();
    }
} else {
    db = new Map();
}


createTemplates();
changesListener()
db.forEach(task => container.append(addTask(task)))



//DOM
function controlElement() {
    const main = document.querySelector("main")

    if (!document.contains(container)) {
        main.append(container)
    }
}

form.addEventListener('submit', e => {
    const txt = form.elements.textField?.value.trim();
    e.preventDefault();
    controlElement()
    if (!txt) return;
    container.append(addTask({ txt }))
    form.reset();
});


container.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (e.target.name === 'undo' || e.target.name === 'done') return toggleState(id);
    if (e.target.name == 'remove') return deleteCard(id);
})


function createTemplates() {
    template.empty = createElement({
        html: `<p class="todo-content">No hay tareas pendientes</p>
            <i class="fa-solid fa-celebration">🥳</i>`,
        classes: ["todo-card", "empty"]
    })

    template.normal = createElement({
        html: `<p class="todo-content"></p>
    <div class="btns-menu">
    <button role="button" aria-label="done" name="done" class="done-btn icons fa-solid fa-check"></button>
    <button role="button" aria-label="remove" name="remove" class="delete-btn icons fa-solid fa-minus"></button>
            </div>`,
        classes: ["todo-card"]
    })

    template.done = createElement({
        html: `<p class="todo-content"></p>
            <div class="btns-menu">
            <button role="button" aria-label="undo" name="undo" class="undo-btn icons fa-solid fa-rotate-left"></button>
            <button role="button" aria-label="remove" name="remove" class="delete-btn icons fa-solid fa-minus"></button>
            </div>`,
        classes: ["todo-card", "done"]
    })


}

function createElement(config) {
    if (!config) return;

    let { element = 'div', html, classes } = config;

    const card = document.createElement(element);
    card.innerHTML = html;
    classes.forEach(cls => card.classList.add(cls))

    return card;
}


//functions


function addTask({ id, txt, isDone = false }) {
    id = id ?? `${Date.now()}`;
    const task = { id, txt, isDone }
    db.set(id, task)

    let cardTemplate = isDone ? template.done.cloneNode(true) : template.normal.cloneNode(true)
    cardTemplate.querySelector(".todo-content").textContent = task.txt;
    ([...cardTemplate.querySelectorAll(".btns-menu > button")]).forEach(btn => btn.dataset.id = task.id)
    cardTemplate.dataset.id = task.id

    changesListener()
    return cardTemplate
}


function toggleState(id) {
    const card = db.get(id)
    if (!card) return
    card.isDone = !card.isDone;

    const prev = container.querySelector(`.todo-card[data-id="${id}"]`);
    if (!prev) return;
    container.replaceChild(addTask(card), prev)
    changesListener()
}

function deleteCard(id) {
    db.delete(id)
    const card = container.querySelector(`.todo-card[data-id="${id}"]`);
    if (!card) return
    card.remove();
    changesListener()
}

function changesListener() {
    if (db.size > 0) template.empty.remove();
    else container.append(template.empty);

    const json = JSON.stringify([...db.entries()])
    localStorage.setItem("db", json)
}
