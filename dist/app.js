// app.js — compilado desde app.ts (ES2022, sin módulos)
// TaskManager está disponible como clase global desde TaskManager.js
"use strict";
const formulario      = document.querySelector('#form-tareas');
const inputTitulo     = document.querySelector('#input-titulo');
const selectPrioridad = document.querySelector('#select-prioridad');
const listaContenedor = document.querySelector('#lista-tareas');
const loadingState    = document.querySelector('#loading-state');
const botonesFiltro   = document.querySelectorAll('.btn-filtro');

const manager = new TaskManager(listaContenedor, loadingState);

formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const titulo    = inputTitulo.value.trim();
    const prioridad = selectPrioridad.value;

    if (!titulo) {
        inputTitulo.focus();
        return;
    }

    manager.agregarTarea(titulo, prioridad);
    formulario.reset();
    inputTitulo.focus();
});

botonesFiltro.forEach((boton) => {
    boton.addEventListener('click', (event) => {
        document.querySelector('.btn-filtro.active')?.classList.remove('active');
        const btn = event.currentTarget;
        btn.classList.add('active');

        const rawFiltro = btn.dataset['filtro'];
        const filtro = rawFiltro ?? 'Todas';
        manager.setFiltro(filtro);
    });
});

manager.inicializar();
