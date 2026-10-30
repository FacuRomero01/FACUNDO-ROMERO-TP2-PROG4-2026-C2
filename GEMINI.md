
# Instrucciones globales del proyecto

## 1. Contexto del proyecto
Este proyecto es una red social desarrollada como trabajo práctico de Programación IV.

Tecnologías obligatorias:
- Frontend: Angular.
- Backend: NestJS.
- Base de datos: MongoDB.
- Autenticación: JWT.

El proyecto se desarrolla en seis sprints. Cada nueva funcionalidad debe integrarse con las anteriores.

## 2. Idioma y nomenclatura
- Escribir en español los nombres de variables, funciones, clases, métodos y servicios propios del proyecto.
- Utilizar nombres descriptivos que expresen claramente su propósito.
- No utilizar nombres genéricos como `x`, `v`, `tmp` o `data` cuando sea posible indicar qué representan.
- Ejemplos: `crearPublicacion`, `usuarioId`, `estaCargando`, `UsuariosService`.
- Mantener los nombres obligatorios de Angular, NestJS y otras bibliotecas, como `ngOnInit`, `@Controller`, `@Get` y `@Post`.
- Mantener una nomenclatura consistente en todo el proyecto.

## 3. Arquitectura y reutilización
- Antes de implementar algo, revisar la arquitectura y el código existente.
- Reutilizar servicios, componentes, interfaces, DTO, validadores y utilidades cuando corresponda.
- Evitar duplicar lógica de negocio.
- Mantener una separación clara de responsabilidades.
- Respetar los patrones y convenciones que ya utiliza el proyecto.
- No crear abstracciones innecesarias ni sobrecomplicar soluciones simples.

## 4. Calidad del código
- Priorizar legibilidad, simplicidad y mantenibilidad.
- Utilizar TypeScript con tipado explícito y estricto.
- Evitar `any` salvo que exista una justificación concreta.
- Manejar correctamente errores, estados de carga y casos límite.
- Evitar código muerto, duplicado o innecesariamente complejo.
- Seguir las convenciones de Angular y NestJS.

## 5. Seguridad
- Validar los datos recibidos del cliente tanto como corresponda en el frontend como en el backend.
- No confiar en los permisos ni en los datos enviados por el cliente.
- Verificar autenticación y autorización en el servidor.
- Proteger las rutas y operaciones administrativas.
- No exponer contraseñas, secretos, tokens ni información sensible.
- Aplicar correctamente las reglas de acceso y los permisos por rol.

## 6. Compatibilidad y cambios
- No romper funcionalidades existentes al implementar nuevas.
- Antes de modificar un archivo, revisar sus dependencias y usos.
- Evitar refactorizaciones generales que no sean necesarias para la tarea.
- No eliminar código funcional sin justificarlo.
- Mantener compatibilidad con la arquitectura y los contratos existentes.
- Si una decisión requiere modificar funcionalidades previas, explicar el motivo y verificar sus efectos.

## 7. Dependencias
- No agregar dependencias externas sin una necesidad real.
- Antes de instalar una biblioteca, verificar si el proyecto ya dispone de una alternativa.
- Justificar cualquier dependencia nueva.

## 8. Pruebas y validación
- Crear o actualizar pruebas para las funcionalidades modificadas.
- Verificar los casos exitosos, errores y casos límite relevantes.
- Ejecutar las pruebas disponibles y las verificaciones de compilación.
- Corregir los errores introducidos antes de finalizar.
- No afirmar que una prueba se ejecutó si no se ejecutó realmente.

## 9. Documentación
- Actualizar la documentación cuando cambien funcionalidades, endpoints, modelos o configuraciones.
- Documentar decisiones técnicas relevantes.
- Mantener los ejemplos y las instrucciones de instalación actualizados.

## 10. Forma de trabajar
Antes de implementar una tarea:
1. Analizar el código existente.
2. Identificar los archivos y módulos afectados.
3. Proponer una solución compatible con la arquitectura actual.
4. Implementar únicamente los cambios necesarios.
5. Verificar las funcionalidades relacionadas.
6. Ejecutar las pruebas pertinentes.
7. Resumir los archivos modificados, las decisiones tomadas y las pruebas realizadas.

No dar por finalizada una tarea si quedan errores conocidos relacionados con los cambios realizados.
