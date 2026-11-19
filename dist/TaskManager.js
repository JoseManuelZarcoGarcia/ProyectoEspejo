// TaskManager.js — compilado desde TaskManager.ts (ES2022, sin módulos)
"use strict";
const TAREAS_INICIALES = [
    { id: 1, titulo: 'Aprender la sintaxis de ES6',   prioridad: 'Alta',  completada: true  },
    { id: 2, titulo: 'Dominar la asincronía y Fetch', prioridad: 'Media', completada: false },
    { id: 3, titulo: 'Migrar el proyecto a Angular',  prioridad: 'Baja',  completada: false }
];

class TaskManager {
    tareas = [];
    filtroActual = 'Todas';
    STORAGE_KEY = 'devtask-tareas';
    listaContenedor;
    loadingState;

    constructor(listaContenedor, loadingState) {
        this.listaContenedor = listaContenedor;
        this.loadingState    = loadingState;
    }

    async inicializar() {
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            this.cargar();
            this.loadingState.style.display = 'none';
            this.render();
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.loadingState.textContent = 'No se pudo iniciar la aplicación.';
        }
    }

    agregarTarea(titulo, prioridad) {
        const nueva = { id: Date.now(), titulo, prioridad, completada: false };
        this.tareas = [...this.tareas, nueva];
        this.guardar();
        this.render();
    }

    toggleCompletada(id) {
        this.tareas = this.tareas.map(tarea =>
            tarea.id === id
                ? { ...tarea, completada: !tarea.completada }
                : tarea
        );
        this.guardar();
        this.render();
    }

    setFiltro(filtro) {
        this.filtroActual = filtro;
        this.render();
    }

    getTareasFiltradas() {
        return this.tareas.filter(tarea => {
            if (this.filtroActual === 'Pendientes')  return !tarea.completada;
            if (this.filtroActual === 'Completadas') return  tarea.completada;
            return true;
        });
    }

    guardar() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tareas));
    }

    cargar() {
        const datos = localStorage.getItem(this.STORAGE_KEY);
        if (datos !== null) {
            try {
                const guardadas = JSON.parse(datos);
                if (Array.isArray(guardadas)) {
                    this.tareas = guardadas;
                }
            } catch (error) {
                console.error('Error al cargar las tareas:', error);
                this.tareas = [...TAREAS_INICIALES];
            }
        } else {
            this.tareas = [...TAREAS_INICIALES];
        }
    }

    render() {
        this.listaContenedor.innerHTML = '';
        const filtradas = this.getTareasFiltradas();

        if (filtradas.length === 0) {
            const mensaje = document.createElement('li');
            mensaje.className = 'mensaje-vacio';
            mensaje.textContent = 'No hay tareas para mostrar.';
            this.listaContenedor.appendChild(mensaje);
            return;
        }

        filtradas.forEach(tarea => {
            this.listaContenedor.appendChild(this.renderTarea(tarea));
        });
    }

    renderTarea(tarea) {
        const li = document.createElement('li');
        li.classList.add('item-tarea', tarea.prioridad);
        if (tarea.completada) li.classList.add('completada');

        const infoDiv = document.createElement('div');
        infoDiv.className = 'tarea-info';

        const titulo = document.createElement('span');
        titulo.className = 'tarea-titulo';
        titulo.textContent = tarea.titulo;

        const badge = document.createElement('span');
        badge.className = `badge badge-${tarea.prioridad.toLowerCase()}`;
        badge.textContent = tarea.prioridad;

        infoDiv.appendChild(titulo);
        infoDiv.appendChild(badge);

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-toggle';
        boton.textContent = tarea.completada ? '↩ Pendiente' : '✓ Completar';
        boton.addEventListener('click', () => this.toggleCompletada(tarea.id));

        li.appendChild(infoDiv);
        li.appendChild(boton);

        return li;
    }
}
