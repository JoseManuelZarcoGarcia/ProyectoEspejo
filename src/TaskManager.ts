/* ================================================================
 * TaskManager.ts — Fase 2: POO Encapsulada con TypeScript
 * ----------------------------------------------------------------
 * Sin export/import: se compila como script global y funciona
 * directamente en el navegador con <script src="dist/TaskManager.js">
 *
 * Qué concepto de cada reto se aplica aquí:
 *  Reto 1 → Interfaz `Tarea` + tipos unión `Prioridad` y `Filtro`
 *  Reto 2 → Inmutabilidad: map() + spread al modificar tareas
 *  Reto 3 → Encapsulación: propiedades `private`, métodos `public`
 *  Reto 4 → Tipado seguro al leer JSON de localStorage (unknown)
 * ================================================================ */

// ── Tipos e interfaces (Reto 1) ──────────────────────────────────

/** Los únicos valores posibles para la prioridad de una tarea */
type Prioridad = 'Alta' | 'Media' | 'Baja';

/** Los únicos valores posibles para el filtro de visualización */
type Filtro = 'Todas' | 'Pendientes' | 'Completadas';

/** Contrato de datos de una tarea (Reto 1: interfaz) */
interface Tarea {
  readonly id: number;   // readonly: el id no cambia nunca
  titulo: string;
  prioridad: Prioridad;
  completada: boolean;
}

// ── Datos de demostración (primera carga) ────────────────────────

const TAREAS_INICIALES: Tarea[] = [
  { id: 1, titulo: 'Aprender la sintaxis de ES6',   prioridad: 'Alta',  completada: true  },
  { id: 2, titulo: 'Dominar la asincronía y Fetch', prioridad: 'Media', completada: false },
  { id: 3, titulo: 'Migrar el proyecto a Angular',  prioridad: 'Baja',  completada: false }
];

// ── Clase principal (Reto 3: encapsulación) ──────────────────────

class TaskManager {

  // Propiedades privadas: el estado interno no es accesible desde fuera
  private tareas: Tarea[] = [];
  private filtroActual: Filtro = 'Todas';
  private readonly STORAGE_KEY = 'devtask-tareas';

  // Referencias tipadas al DOM
  private readonly listaContenedor: HTMLUListElement;
  private readonly loadingState: HTMLElement;

  constructor(listaContenedor: HTMLUListElement, loadingState: HTMLElement) {
    this.listaContenedor = listaContenedor;
    this.loadingState    = loadingState;
  }

  // ── Métodos públicos (API de la clase) ──────────────────────────

  /** Inicialización asíncrona: simula latencia de red y carga los datos */
  public async inicializar(): Promise<void> {
    try {
      await new Promise<void>(resolve => setTimeout(resolve, 1500));
      this.cargar();
      this.loadingState.style.display = 'none';
      this.render();
    } catch (error) {
      console.error('Error al inicializar la aplicación:', error);
      this.loadingState.textContent = 'No se pudo iniciar la aplicación.';
    }
  }

  /** Añade una nueva tarea al array de forma inmutable (Reto 2) */
  public agregarTarea(titulo: string, prioridad: Prioridad): void {
    const nueva: Tarea = {
      id: Date.now(),
      titulo,
      prioridad,
      completada: false
    };
    this.tareas = [...this.tareas, nueva]; // spread: nuevo array, no mutación
    this.guardar();
    this.render();
  }

  /** Alterna completada/pendiente de forma inmutable (Reto 2: map + spread) */
  public toggleCompletada(id: number): void {
    this.tareas = this.tareas.map((tarea: Tarea): Tarea =>
      tarea.id === id
        ? { ...tarea, completada: !tarea.completada } // nuevo objeto
        : tarea
    );
    this.guardar();
    this.render();
  }

  /** Cambia el filtro activo y fuerza un re-render */
  public setFiltro(filtro: Filtro): void {
    this.filtroActual = filtro;
    this.render();
  }

  /** Devuelve las tareas aplicando el filtro actual */
  public getTareasFiltradas(): Tarea[] {
    return this.tareas.filter((tarea: Tarea): boolean => {
      if (this.filtroActual === 'Pendientes')  return !tarea.completada;
      if (this.filtroActual === 'Completadas') return  tarea.completada;
      return true; // 'Todas'
    });
  }

  // ── Métodos privados (implementación interna) ───────────────────

  /** Persiste el array en localStorage como JSON */
  private guardar(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tareas));
  }

  /** Lee las tareas de localStorage con tipado seguro (Reto 4: unknown) */
  private cargar(): void {
    const datos = localStorage.getItem(this.STORAGE_KEY);

    if (datos !== null) {
      try {
        const guardadas: unknown = JSON.parse(datos); // unknown → fuerza validación
        if (Array.isArray(guardadas)) {
          this.tareas = guardadas as Tarea[];
        }
      } catch (error) {
        console.error('Error al cargar las tareas:', error);
        this.tareas = [...TAREAS_INICIALES];
      }
    } else {
      // Primera vez: cargamos los datos de demostración
      this.tareas = [...TAREAS_INICIALES];
    }
  }

  /** Vuelca las tareas filtradas al DOM */
  private render(): void {
    this.listaContenedor.innerHTML = '';
    const filtradas = this.getTareasFiltradas();

    if (filtradas.length === 0) {
      const mensaje = document.createElement('li');
      mensaje.className = 'mensaje-vacio';
      mensaje.textContent = 'No hay tareas para mostrar.';
      this.listaContenedor.appendChild(mensaje);
      return;
    }

    filtradas.forEach((tarea: Tarea) => {
      this.listaContenedor.appendChild(this.renderTarea(tarea));
    });
  }

  /** Crea y devuelve el elemento <li> tipado de una tarea */
  private renderTarea(tarea: Tarea): HTMLLIElement {
    const li = document.createElement('li');
    li.classList.add('item-tarea', tarea.prioridad);
    if (tarea.completada) li.classList.add('completada');

    // Columna izquierda: título + badge de prioridad
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

    // Botón de acción
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
