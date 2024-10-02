
// Función de depuración
function debug(message) {
    console.log(`[DEBUG] ${message}`);
}

// Registro del Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => debug('Service Worker registrado'))
        .catch(error => debug('Error al registrar Service Worker:', error));
}

// Funciones para mostrar diferentes secciones
function showMainContent() {
    debug('Mostrando contenido principal');
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('createProfileSection').style.display = 'none';
    document.getElementById('profileManagement').style.display = 'none';
    document.getElementById('taskPage').style.display = 'none';
}

function showCreateProfile() {
    debug('Mostrando sección de creación de perfil');
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('createProfileSection').style.display = 'block';
    document.getElementById('profileManagement').style.display = 'none';
    document.getElementById('taskPage').style.display = 'none';
}

function showProfileManagement() {
    debug('Mostrando sección de gestión de perfiles');
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('createProfileSection').style.display = 'none';
    document.getElementById('profileManagement').style.display = 'block';
    document.getElementById('taskPage').style.display = 'none';
    loadProfiles();
}

function showTaskPage(username) {
    debug(`Mostrando página de tareas para ${username}`);
    localStorage.setItem('perfilActivo', username);
    window.location.href = 'Todo.html';
}

// Función para cargar y mostrar los perfiles
function loadProfiles() {
    debug('Iniciando carga de perfiles');
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = 'Cargando perfiles...';

    caches.open('user-profiles-cache-v1').then(cache => {
        cache.keys().then(keys => {
            if (keys.length === 0) {
                profileList.innerHTML = 'No hay perfiles guardados.';
            } else {
                profileList.innerHTML = '';
                keys.forEach(key => {
                    const username = key.url.split('/').pop();
                    cache.match(key).then(response => {
                        response.json().then(profile => {
                            const profileDiv = document.createElement('div');
                            profileDiv.innerHTML = `
                                <h3>${profile.username}</h3>
                                <p>Nombre: ${profile.fullName}</p>
                                <p>Email: ${profile.email}</p>
                                <p>Creado: ${new Date(profile.createdAt).toLocaleString()}</p>
                                <button onclick="deleteProfile('${profile.username}')">Eliminar</button>
                                <button onclick="showTaskPage('${profile.username}')">Seleccionar</button>
                            `;
                            profileList.appendChild(profileDiv);
                        }).catch(error => debug(`Error al parsear JSON: ${error}`));
                    }).catch(error => debug(`Error al hacer match de la clave: ${error}`));
                });
            }
        }).catch(error => debug(`Error al obtener claves: ${error}`));
    }).catch(error => debug(`Error al abrir el caché: ${error}`));
}

// Función para crear un nuevo perfil
function createProfile(username, fullName, email) {
    debug(`Iniciando creación de perfil para: ${username}`);
    const newProfile = {
        username: username,
        fullName: fullName,
        email: email,
        createdAt: new Date().toISOString(),
        tareas: [],
        repasos: []
    };

    caches.open('user-profiles-cache-v1').then(cache => {
        cache.match(`/api/profile/${username}`).then(existingProfile => {
            if (existingProfile) {
                debug(`El perfil ${username} ya existe`);
                alert(`El perfil ${username} ya existe. Por favor, elige otro nombre de usuario.`);
            } else {
                const profileResponse = new Response(JSON.stringify(newProfile));
                cache.put(`/api/profile/${username}`, profileResponse).then(() => {
                    debug(`Perfil guardado en caché para: ${username}`);
                    alert(`Perfil de ${username} creado con éxito.`);
                    document.getElementById('createProfileForm').reset();
                    showProfileManagement();
                }).catch(error => debug(`Error al guardar perfil en caché: ${error}`));
            }
        }).catch(error => debug(`Error al verificar perfil existente: ${error}`));
    }).catch(error => debug(`Error al abrir el caché: ${error}`));
}

// Función para eliminar un perfil
function deleteProfile(username) {
    if (confirm(`¿Estás seguro de que quieres eliminar el perfil de ${username}?`)) {
        caches.open('user-profiles-cache-v1').then(cache => {
            cache.delete(`/api/profile/${username}`).then(() => {
                debug(`Perfil de ${username} eliminado`);
                alert(`Perfil de ${username} eliminado.`);
                loadProfiles();
            }).catch(error => debug(`Error al eliminar perfil: ${error}`));
        }).catch(error => debug(`Error al abrir el caché: ${error}`));
    }
}

// Función para manejar el inicio de sesión
function handleLogin(username) {
    debug(`Intentando iniciar sesión con el usuario: ${username}`);
    caches.open('user-profiles-cache-v1').then(cache => {
        cache.match(`/api/profile/${username}`).then(response => {
            if (response) {
                response.json().then(profile => {
                    debug(`Perfil encontrado para ${username}, redirigiendo a la página de tareas`);
                    showTaskPage(username);
                }).catch(error => debug(`Error al parsear perfil: ${error}`));
            } else {
                debug(`Perfil no encontrado para ${username}`);
                alert('Perfil no encontrado. Por favor, crea un nuevo perfil.');
                showCreateProfile();
            }
        }).catch(error => debug(`Error al buscar perfil: ${error}`));
    }).catch(error => debug(`Error al abrir el caché: ${error}`));
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM completamente cargado y parseado');
    
    // Listener para el formulario de inicio de sesión
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        debug('Formulario de inicio de sesión encontrado, añadiendo event listener');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            handleLogin(username);
        });
    } else {
        debug('No se encontró el formulario de inicio de sesión');
    }

    // Listener para el formulario de creación de perfil
    const createProfileForm = document.getElementById('createProfileForm');
    if (createProfileForm) {
        debug('Formulario de creación de perfil encontrado, añadiendo event listener');
        createProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('newUsername').value;
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            createProfile(username, fullName, email);
        });
    } else {
        debug('No se encontró el formulario de creación de perfil');
    }

    // Inicialización
    showMainContent();
});

// Exponer funciones globalmente para que puedan ser llamadas desde el HTML
window.showMainContent = showMainContent;
window.showCreateProfile = showCreateProfile;
window.showProfileManagement = showProfileManagement;
window.deleteProfile = deleteProfile;
window.showTaskPage = showTaskPage;