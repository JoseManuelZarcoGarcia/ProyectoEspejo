/* 1. Estado de la aplicación */
let tareas = [
  {
    id: 1,
    titulo: 'Aprender la sintaxis de ES6',
    prioridad: 'Alta',
    completada: true
  },
  {
    id: 2,
    titulo: 'Dominar la asincronía y Fetch',
    prioridad: 'Media',
    completada: false
  },
  {
    id: 3,
    titulo: 'Migrar el proyecto a Angular',
    prioridad: 'Baja',
    completada: false
  }
];

let filtroActual = 'Todas';

/* 2. Selectores del DOM */
const formulario = document.querySelector('#form-tareas');
const inputTitulo = document.querySelector('#input-titulo');
const selectPrioridad = document.querySelector('#select-prioridad');
const listaContenedor = document.querySelector('#lista-tareas');
const loadingState = document.querySelector('#loading-state');
const botonesFiltro = document.querySelectorAll('.btn-filtro');

/* Persistencia de tareas en el navegador */

function guardarTareas() {
  localStorage.setItem('devtask-tareas', JSON.stringify(tareas));
}

function cargarTareas() {
  const datosGuardados = localStorage.getItem('devtask-tareas');

  if (datosGuardados) {
    try {
      const tareasGuardadas = JSON.parse(datosGuardados);

      if (Array.isArray(tareasGuardadas)) {
        tareas = tareasGuardadas;
      }
    } catch (error) {
      console.error('Error al cargar las tareas:', error);
    }
  }
}


/* 3. Inicialización asíncrona */
async function inicializarApp() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    cargarTareas();

    loadingState.style.display = 'none';
    pintarTareas();
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    loadingState.textContent = 'No se pudo iniciar la aplicación.';
  }
}

/* 4. Renderizado de tareas */
function pintarTareas() {
  // Limpiar la lista antes de volver a renderizar
  listaContenedor.innerHTML = '';

  // Filtrar tareas según el estado seleccionado
  const tareasFiltradas = tareas.filter(tarea => {
    if (filtroActual === 'Pendientes') {
      return !tarea.completada;
    }

    if (filtroActual === 'Completadas') {
      return tarea.completada;
    }

    return true;
  });

  // Mostrar un mensaje si no hay tareas
  if (tareasFiltradas.length === 0) {
    const mensaje = document.createElement('li');
    mensaje.textContent = 'No hay tareas para mostrar.';
    listaContenedor.appendChild(mensaje);
    return;
  }

  // Crear un elemento por cada tarea
  tareasFiltradas.forEach(tarea => {
    const li = document.createElement('li');

    // Clases según prioridad y estado
    li.classList.add('item-tarea', tarea.prioridad);

    if (tarea.completada) {
      li.classList.add('completada');
    }

    // Contenedor del texto
    const contenido = document.createElement('span');
    contenido.textContent = tarea.titulo;

    // Botón para alternar el estado
    const botonEstado = document.createElement('button');
    botonEstado.type = 'button';
    botonEstado.textContent = tarea.completada
      ? 'Marcar pendiente'
      : 'Completar';

    botonEstado.addEventListener('click', () => {
      tareas = tareas.map(item =>
        item.id === tarea.id
          ? { ...item, completada: !item.completada }
          : item
      );

      guardarTareas();
      pintarTareas();
    });

    // Añadir nodos al elemento de la lista
    li.appendChild(contenido);
    li.appendChild(botonEstado);
    listaContenedor.appendChild(li);
  });
}

/* 5. Evento del formulario */
formulario.addEventListener('submit', event => {
  event.preventDefault();

  // Capturar los valores
  const titulo = inputTitulo.value.trim();
  const prioridad = selectPrioridad.value;

  if (!titulo) {
    inputTitulo.focus();
    return;
  }

  // Crear una nueva tarea
  const nuevaTarea = {
    id: Date.now(),
    titulo: titulo,
    prioridad: prioridad,
    completada: false
  };

  // Actualizar el array de tareas
  tareas = [...tareas, nuevaTarea];

  // GUARDAR las tareas en localStorage
  guardarTareas();

  // Actualizar la pantalla
  pintarTareas();

  // Limpiar el formulario
  formulario.reset();
  inputTitulo.focus();
});

/* 6. Eventos de los botones de filtro */
botonesFiltro.forEach(boton => {
  boton.addEventListener('click', event => {
    // Actualizar el botón activo
    document.querySelector('.btn-filtro.active')
      ?.classList.remove('active');

    event.currentTarget.classList.add('active');

    // Actualizar el filtro seleccionado
    filtroActual = event.currentTarget.dataset.filtro;

    // Volver a renderizar
    pintarTareas();
  });
});

/* 7. Arrancar la aplicación */
inicializarApp();