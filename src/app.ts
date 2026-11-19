/* ================================================================
 * app.ts — Punto de entrada de la aplicación
 * ----------------------------------------------------------------
 * Sin import: TaskManager está disponible como clase global porque
 * dist/TaskManager.js se carga antes en el HTML.
 * Responsabilidad única: conectar el DOM con el TaskManager.
 * ================================================================ */

// ── Selectores del DOM con tipado genérico estricto ───────────────
const formulario      = document.querySelector<HTMLFormElement>('#form-tareas')!;
const inputTitulo     = document.querySelector<HTMLInputElement>('#input-titulo')!;
const selectPrioridad = document.querySelector<HTMLSelectElement>('#select-prioridad')!;
const listaContenedor = document.querySelector<HTMLUListElement>('#lista-tareas')!;
const loadingState    = document.querySelector<HTMLElement>('#loading-state')!;
const botonesFiltro   = document.querySelectorAll<HTMLButtonElement>('.btn-filtro');

// ── Instancia del gestor (único objeto, estado centralizado) ──────
const manager = new TaskManager(listaContenedor, loadingState);

// ── Evento: añadir tarea ──────────────────────────────────────────
formulario.addEventListener('submit', (event: SubmitEvent) => {
  event.preventDefault();

  const titulo    = inputTitulo.value.trim();
  const prioridad = selectPrioridad.value as Prioridad;

  if (!titulo) {
    inputTitulo.focus();
    return;
  }

  manager.agregarTarea(titulo, prioridad);
  formulario.reset();
  inputTitulo.focus();
});

// ── Eventos: botones de filtro ────────────────────────────────────
botonesFiltro.forEach((boton: HTMLButtonElement) => {
  boton.addEventListener('click', (event: MouseEvent) => {
    document.querySelector('.btn-filtro.active')?.classList.remove('active');
    const btn = event.currentTarget as HTMLButtonElement;
    btn.classList.add('active');

    const rawFiltro = btn.dataset['filtro'];
    const filtro: Filtro = (rawFiltro ?? 'Todas') as Filtro;
    manager.setFiltro(filtro);
  });
});

// ── Arrancar la aplicación ────────────────────────────────────────
manager.inicializar();
