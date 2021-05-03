let pagina = 1;

const cita = {
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener("DOMContentLoaded", function() {
    iniciarApp();
});

//* =================
//* === principal ===
//* =================

function iniciarApp() {

    mostrarServicios();

    //* === resalta el div actual segun el tab al que se presiona ===s
    mostrarSeccion();

    //* === oculta o muestra una sección según el tab al que se presiona ===
    cambiarSeccion();

    //* === paginación siguiente y anterior ===
    paginaSiguiente();

    paginaAnterior();

    //* === comprueba la página actual para ocultar o mostrar la paginación ===
    botonesPaginador();

    //* === muestra el resumen de la cita ( o mensaje de error en caso de no pasar la validación )
    mostrarResumen(); 

    //* === almacena el nombre de la cita en el objeto ===
    nombreCita();

    //* === almacena la fecha de la cita en el objeto ===
    fechaCita();

    //* === deshabilita dias pasados ===
    deshabilitarFechaAnterior();

    //* === almacena la hora de la cita en el objeto ===
    horaCita();
}

//* =========================
//* === mostrar servicios ===
//* =========================

async function mostrarServicios() {
    try {
        const resultado = await fetch('./servicios.json');
        const db = await resultado.json();        
        
        const { servicios } = db;                               //* sin destructuring -> const servicios = db.servicios;
        //console.table(servicios);

        //* === generar template html ===
        
        servicios.forEach( servicio => {
            //console.table(servicio);

            const { id, nombre, precio } = servicio;

            //* === DOM Scripting ===
            // generar nombre de servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            // generar precio del servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //console.log(nombreServicio);
            //console.log(precioServicio);

            // generar div contenedor de servicio
            const servicioDiv = document.createElement('DIV');  
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;

            // selecciona un servicio para la cita
            servicioDiv.onclick = seleccionarServicio;

            // inyectar precio y nombre al div de servicio
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //console.log(servicioDiv);

            // inyectarlo en el html
             document.querySelector('#servicios').appendChild(servicioDiv);

        })

    } catch (error) {
        console.log(error);
    }
}

//* =======================
//* === mostrar sección ===
//* =======================

function mostrarSeccion() {

    // eliminar mostrar-seccion de la sección anterior
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior) {
        seccionAnterior.classList.remove('mostrar-seccion');
    }    

    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    // eliminar la clase de actual en el tab anterior
    const tabAnterior = document.querySelector('.tabs .actual');
    if(tabAnterior) {
        tabAnterior.classList.remove('actual');
    }
    
    // agregar la clase de actual en el nuevo tab
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');

    
}

//* =======================
//* === cambiar sección ===
//* =======================

function cambiarSeccion() {

    // seleccionar todos los botones

    const enlaces = document.querySelectorAll('.tabs button');

    enlaces.forEach( enlace => {
        enlace.addEventListener('click', e => {
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);       
   
            // llamar la función de mostrar sección
            mostrarSeccion();

            botonesPaginador();
        })
    })
}

//* =============================
//* === seleccionar  servicio ===
//* =============================

function seleccionarServicio(e) {
    let elemento;

    // forzar que el elemento al cual le damos click sea el DIV
    if(e.target.tagName === 'P') {
        elemento = e.target.parentElement;
    } else {
        elemento = e.target;
    }

    // agregar o quitar clase si la contiene
    if(elemento.classList.contains('seleccionado')) {
        elemento.classList.remove('seleccionado');

        const id = parseInt(elemento.dataset.idServicio);

        eliminarServicio(id);
    } else {
        elemento.classList.add('seleccionado');

        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio),
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent
        };

        // console.log(servicioObj);

        agregarServicio(servicioObj);
    }    
}

//* =========================
//* === eliminar servicio ===
//* =========================

function eliminarServicio(id) {
    const { servicios } = cita;  

    // traer todos los servicios cuyo "id" sea diferente al que estoy eliminando
    cita.servicios = servicios.filter( servicio => servicio.id !== id); 

    //console.log(cita);
}

//* ========================
//* === agregar servicio ===
//* ========================

function agregarServicio(servicioObj) {
    const { servicios } = cita;

    // toma una copia de "servicios" y le agrego "servicioObj"
    cita.servicios = [...servicios, servicioObj];

    mostrarResumen();
}

//* ==================
//* === paginación ===
//* ==================

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () => {
        pagina++;        

        //console.log(pagina);

        botonesPaginador();
    })
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () => {
        pagina--;        

        //console.log(pagina);

        botonesPaginador();
    })
}

function botonesPaginador() {
    const paginaSiguiente = document.querySelector('#siguiente');
    const paginaAnterior = document.querySelector('#anterior');

    if(pagina === 1) {        
        // ocultar botón anterior
        paginaAnterior.classList.add('ocultar');

    } else if (pagina === 3) {
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        // estamos en la página 3, carga el resumen de la cita
        mostrarResumen(); 
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    // cambia la sección que se muestra por la de la página
    mostrarSeccion();

    //console.log(cita);
}

//* =======================
//* === mostrar resumen ===
//* =======================

function mostrarResumen() {
    
    // destructuring
    const { nombre, fecha, hora, servicios } = cita;

    // seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    // limpia el html previo
    while(resumenDiv.firstChild) {
        resumenDiv.removeChild(resumenDiv.firstChild);
    }

    // validación de objeto
    if(Object.values(cita).includes('')) {
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos de Servicios, hora, fecha o nombre';

        noServicios.classList.add('invalidar-cita');

        // agregar a resumenDiv
        resumenDiv.appendChild(noServicios);

        return;
    }

    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';

    // mostrar el resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre:</span> ${nombre}`;
    
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fecha}`;

    const horaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Hora:</span> ${hora}`;

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;

    // iterar sobre el arreglo de servicios
    servicios.forEach( servicio => {

        const { nombre, precio } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');

        const totalServicio = precio.split('$');

        cantidad += parseInt(totalServicio[1].trim());

        // colocar texto y precio en el div
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);

    });

    //* === mostrar html dinámico por pantalla ===

    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML =`<span>Total a pagar: </span> $ ${cantidad}`;

    resumenDiv.appendChild(cantidadPagar);
}

//* ===================
//* === nombre cita ===
//* ===================

function nombreCita() {
    const nombreInput = document.querySelector('#nombre');

    nombreInput.addEventListener('input', e => {
        const nombreTexto = e.target.value.trim();
        
        //console.log(nombreTexto);

        // validación de que "nombreTexto" debe tener algo
        if(nombreTexto === '' || nombreTexto.length < 3) { 
            mostrarAlerta('Nombre no válido', 'error');
        } else {
            const alerta = document.querySelector('.alerta');
            if(alerta) {
                alerta.remove();
            }
            cita.nombre = nombreTexto;

            //console.log(cita);
        }
    });
}

//* ======================
//* === mostrar alerta ===
//* ======================

function mostrarAlerta(mensaje, tipo) {
   
    // si hay una alerta previa, entonces no crear otra
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        
        // detener la ejecución del código
        return;    
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error') {
        alerta.classList.add('error');
    }

    // insertar en el html
    const formulario = document.querySelector('.formulario');
    formulario.appendChild(alerta); 

    // eliminar la alerta después de 3 segundos
     setTimeout(() => {
        alerta.remove();
     }, 3000);
    
}

//* ==================
//* === fecha cita ===
//* ==================

function fechaCita() {
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', e  => {
        //console.log(e.target.value);

        const dia = new Date(e.target.value).getUTCDay();  

        if([0, 6].includes(dia)) {
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de semana no son permitidos', 'error');
        } else {
            cita.fecha = fechaInput.value;

            //console.log(cita);
        }
    })
}

//* ===================================
//* === deshabilitar fecha anterior ===
//* ===================================

function deshabilitarFechaAnterior() {
    const inputFecha = document.querySelector('#fecha');

    const fechaAhora = new Date();
    const year = fechaAhora.getFullYear();
    const mes = fechaAhora.getMonth() + 1;  
    const dia = fechaAhora.getDate() + 1;

    // formato deseado AAAA-MM-DD
    const fechaDeshabilitar = `${year}-${mes < 10 ? `0${mes}` : mes}-${dia}`;

    //console.log(fechaDeshabilitar);

    inputFecha.min = fechaDeshabilitar;

}

//* =================
//* === hora cita ===
//* =================

function horaCita() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', e => {
        
        const horaCita = e.target.value;
        const hora = horaCita.split(':');

        if(hora[0] < 10 || hora[0] > 18) {
            mostrarAlerta('Hoara no válida', 'error');
            setTimeout(() => {
                inputHora.value = '';
            }, 3000);
            
        } else {
            cita.hora = horaCita;
        }

    });

}