// Elementos del DOM
const profileName = document.querySelector('#profileName');
const listaTareas = document.querySelector('#lista-tareas');
const listaRepasos = document.querySelector('#lista-repasos');
const inputTarea = document.querySelector('#input-tarea');
const inputRepaso = document.querySelector('#input-repaso');
const botonEnterTarea = document.querySelector('#boton-enter-tarea');
const botonEnterRepaso = document.querySelector('#boton-enter-repaso');
const playButton = document.querySelector('#playButton');
const logoutButton = document.querySelector('#logoutButton');

// Variables globales
let LIST_TAREAS = [];
let LIST_REPASOS = [];
let id_tareas = 0;
let id_repasos = 0;

// Cargar perfil activo
const perfilActivo = localStorage.getItem('perfilActivo');
if (perfilActivo) {
    profileName.textContent = perfilActivo;
} else {
    // Redirigir a la página de inicio de sesión si no hay perfil activo
    window.location.href = 'index.html';
}

// Funciones
function agregarItem(lista, tarea, id, realizado, eliminado) {
    if (eliminado) return;

    const REALIZADO = realizado ? 'fa-check-circle' : 'fa-circle';
    const LINE = realizado ? 'line-through' : '';

    const elemento = `
        <li id="elemento">
            <i class="far ${REALIZADO}" data="realizado" id="${id}"></i>
            <p class="text ${LINE}">${tarea}</p>
            <i class="fas fa-trash de" data="eliminado" id="${id}"></i> 
        </li>
    `;
    lista.insertAdjacentHTML("beforeend", elemento);
}

function tareaRealizada(element) {
    element.classList.toggle('fa-check-circle');
    element.classList.toggle('fa-circle');
    element.parentNode.querySelector('.text').classList.toggle('line-through');
    const lista = element.closest('ul').id === 'lista-tareas' ? LIST_TAREAS : LIST_REPASOS;
    lista[element.id].realizado = !lista[element.id].realizado;
}

function tareaEliminada(element) {
    element.parentNode.parentNode.removeChild(element.parentNode);
    const lista = element.closest('ul').id === 'lista-tareas' ? LIST_TAREAS : LIST_REPASOS;
    lista[element.id].eliminado = true;
}

function agregarTarea(lista, input, LIST, id_counter) {
    const tarea = input.value;
    if (tarea) {
        agregarItem(lista, tarea, id_counter, false, false);
        LIST.push({
            nombre: tarea,
            id: id_counter,
            realizado: false,
            eliminado: false
        });
        localStorage.setItem(lista.id, JSON.stringify(LIST));
        input.value = '';
        return id_counter + 1;
    }
    return id_counter;
}

// Event Listeners
botonEnterTarea.addEventListener('click', () => {
    id_tareas = agregarTarea(listaTareas, inputTarea, LIST_TAREAS, id_tareas);
});

botonEnterRepaso.addEventListener('click', () => {
    id_repasos = agregarTarea(listaRepasos, inputRepaso, LIST_REPASOS, id_repasos);
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement === inputTarea) {
            id_tareas = agregarTarea(listaTareas, inputTarea, LIST_TAREAS, id_tareas);
        } else if (activeElement === inputRepaso) {
            id_repasos = agregarTarea(listaRepasos, inputRepaso, LIST_REPASOS, id_repasos);
        }
    }
});

listaTareas.addEventListener('click', function(event) {
    const element = event.target;
    const elementData = element.attributes.data && element.attributes.data.value;
    
    if (elementData === 'realizado') {
        tareaRealizada(element);
    } else if (elementData === 'eliminado') {
        tareaEliminada(element);
    }
    localStorage.setItem('lista-tareas', JSON.stringify(LIST_TAREAS));
});

listaRepasos.addEventListener('click', function(event) {
    const element = event.target;
    const elementData = element.attributes.data && element.attributes.data.value;
    
    if (elementData === 'realizado') {
        tareaRealizada(element);
    } else if (elementData === 'eliminado') {
        tareaEliminada(element);
    }
    localStorage.setItem('lista-repasos', JSON.stringify(LIST_REPASOS));
});

// Botón PLAY
playButton.addEventListener('click', () => {
    window.location.href = 'Pomo.html';
});

// Botón CERRAR SESIÓN
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('perfilActivo');
    window.location.href = 'index.html';
});

// Cargar datos guardados
let data_tareas = localStorage.getItem('lista-tareas');
let data_repasos = localStorage.getItem('lista-repasos');

function cargarLista(lista, array) {
    array.forEach(function(item) {
        agregarItem(lista, item.nombre, item.id, item.realizado, item.eliminado);
    });
}

if(data_tareas) {
    LIST_TAREAS = JSON.parse(data_tareas);
    id_tareas = LIST_TAREAS.length;
    cargarLista(listaTareas, LIST_TAREAS);
} else {
    LIST_TAREAS = [];
    id_tareas = 0;
}

if(data_repasos) {
    LIST_REPASOS = JSON.parse(data_repasos);
    id_repasos = LIST_REPASOS.length;
    cargarLista(listaRepasos, LIST_REPASOS);
} else {
    LIST_REPASOS = [];
    id_repasos = 0;
}