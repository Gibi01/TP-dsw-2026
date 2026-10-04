from pathlib import Path
import re, math, html
from PIL import Image, ImageDraw, ImageFont
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.defensa'
OUT.mkdir(exist_ok=True)
FONT = Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('Guide', str(FONT/'arial.ttf')))
pdfmetrics.registerFont(TTFont('GuideBold', str(FONT/'arialbd.ttf')))
pdfmetrics.registerFontFamily('Guide', normal='Guide', bold='GuideBold', italic='Guide', boldItalic='GuideBold')
INK='#16324A'; BLUE='#EAF2F8'; GRAY='#52616D'; GREEN='#EAF5EE'

def diagram(name, boxes, edges, size=(1800,650)):
    im=Image.new('RGB',size,'white'); d=ImageDraw.Draw(im)
    f=ImageFont.truetype(str(FONT/'arial.ttf'),28)
    fb=ImageFont.truetype(str(FONT/'arialbd.ttf'),31)
    for a,b,label in edges:
        xa,ya,wa,ha,*_=boxes[a]; xb,yb,wb,hb,*_=boxes[b]
        if abs(xb-xa)>abs(yb-ya):
            start=(xa+wa,ya+ha/2) if xb>xa else (xa,ya+ha/2)
            end=(xb,yb+hb/2) if xb>xa else (xb+wb,yb+hb/2)
        else:
            start=(xa+wa/2,ya+ha) if yb>ya else (xa+wa/2,ya)
            end=(xb+wb/2,yb) if yb>ya else (xb+wb/2,yb+hb)
        if name=='modelo' and a==5 and b==7:
            start=(xa+wa/2,ya+ha); end=(xb+wb/2,yb+hb)
            d.line([start,(start[0],620),(end[0],620),end],fill=INK,width=4)
            ang=-math.pi/2
        else:
            d.line([start,end],fill=INK,width=4)
            ang=math.atan2(end[1]-start[1],end[0]-start[0])
        l=15
        d.polygon([end,(end[0]-l*math.cos(ang-.5),end[1]-l*math.sin(ang-.5)),(end[0]-l*math.cos(ang+.5),end[1]-l*math.sin(ang+.5))],fill=INK)
        if label:
            mx=(start[0]+end[0])/2; my=620 if name=='modelo' and a==5 and b==7 else (start[1]+end[1])/2
            bb=d.textbbox((0,0),label,font=f); w=bb[2]-bb[0]
            d.rectangle((mx-w/2-8,my-20,mx+w/2+8,my+17),fill='white')
            d.text((mx,my),label,font=f,fill=INK,anchor='mm')
    for x,y,w,h,title,body in boxes:
        d.rounded_rectangle((x,y,x+w,y+h),radius=18,fill=BLUE,outline=INK,width=3)
        lines=[title]+body.split('\n'); total=42*len(lines)
        for j,line in enumerate(lines):
            d.text((x+w/2,y+(h-total)/2+22+j*42),line,font=fb if j==0 else f,fill=INK,anchor='mm')
    path=OUT/(name+'.png'); im.save(path); return path

ARCH=diagram('arquitectura',[
 (40,60,470,190,'React','Pantallas y estado\nPuerto 5173'),(665,60,470,190,'Servicios','Fetch y Better Auth\nSolicitudes a /api'),
 (1290,60,470,190,'Proxy de Vite','Reenvío local de /api'),(1290,380,470,190,'Express','Rutas y permisos\nPuerto 3000'),
 (665,380,470,190,'Persistencia','MikroORM y mysql2'),(40,380,470,190,'MySQL','Datos persistentes\nServicio externo')],
 [(0,1,''),(1,2,''),(2,3,''),(3,4,''),(4,5,'')])
MODEL=diagram('modelo',[
 (40,50,350,150,'Cuenta Better Auth','Identidad y credenciales'),(520,50,350,150,'Usuario','Perfil de negocio'),(1030,50,310,150,'Doctor','Matrícula y activo'),
 (1450,50,310,150,'Especialidad','Catálogo'),(1030,400,310,150,'Agenda','Bloque semanal'),(520,400,350,150,'Turno','Fecha y estado'),
 (40,400,350,150,'Obra social','Opcional por turno'),(1450,400,310,150,'Notificación','Correo persistido')],
 [(0,1,'1 a 1'),(1,2,'0 o 1'),(2,3,'N a N'),(2,4,'1 a N'),(1,5,'1 a N'),(2,5,'1 a N'),(6,5,'0 o 1'),(5,7,'1 a N')],size=(1800,700))
AUTH=diagram('sesion',[
 (40,60,350,170,'Inicio de sesión','Email y contraseña'),(490,60,350,170,'Better Auth','Valida y crea sesión'),(940,60,350,170,'Navegador','Cookie HttpOnly'),
 (1390,60,350,170,'Petición privada','Cookie incluida'),(940,390,350,170,'Perfil y rol','req.usuario'),(1390,390,350,170,'Middleware','Consulta la sesión')],
 [(0,1,''),(1,2,''),(2,3,''),(3,5,''),(5,4,'')])
RES=diagram('reserva',[
 (40,50,350,170,'Agenda semanal','Día y duración'),(495,50,350,170,'Disponibilidad','Horarios menos ocupados'),(950,50,350,170,'Selección','Doctor y obra social'),
 (1405,50,350,170,'Sesión','Sin sesión a registro'),(495,395,350,170,'Mis turnos','Respuesta de la API'),(950,395,350,170,'MySQL','Turno pendiente'),(1405,395,350,170,'Validación','Fecha y horario libres')],
 [(0,1,''),(1,2,''),(2,3,''),(3,6,''),(6,5,''),(5,4,'')])
STATES=diagram('estados',[
 (40,235,370,175,'Pendiente','Reserva creada'),(710,20,430,165,'Cancelado','Dueño o administrador'),(710,245,430,165,'Asistido','Doctor dentro de 15 min'),
 (710,470,430,165,'No asistido','Doctor o tarea automática'),(1380,245,370,165,'Historial','Se conserva el turno')],
 [(0,1,''),(0,2,''),(0,3,''),(1,4,''),(2,4,''),(3,4,'')],size=(1800,680))
MAIL=diagram('correos',[
 (40,70,350,180,'Evento de negocio','Estado del turno'),(495,70,350,180,'Cola en MySQL','Notificación pendiente'),(950,70,350,180,'Tarea cada minuto','Reclama y procesa'),
 (1405,70,350,180,'Resend','Envía el correo'),(950,400,350,150,'Fallo','Reintento diferido'),(1405,400,350,150,'Éxito','Estado enviado')],
 [(0,1,''),(1,2,''),(2,3,''),(3,4,''),(3,5,'')])

PAGES=[]
def page(title, intro='', blocks=None): PAGES.append((title,intro,blocks or []))
def p(t): return ('p',t)
def h(t): return ('h',t)
def pic(path,caption,height=175): return ('image',path,caption,height)
def table(headers,rows,widths=None): return ('table',headers,rows,widths)
def code(t): return ('code',t)
def src(*paths): return ('source',paths)

page('Guía de defensa del sistema de turnos médicos',
 'Hospital Ripper · TP Desarrollo de Software · 1 de octubre de 2026',[
 p('Esta guía sirve para explicar el sistema durante la defensa: qué problema resuelve, cómo circulan los datos, dónde se validan las reglas y qué evidencia demuestra el funcionamiento. El sistema permite organizar la disponibilidad de profesionales, reservar turnos y registrar la asistencia sin perder el historial.'),
 pic(ARCH,'Figura 1  Recorrido general de una solicitud',185),
 h('La explicación central'),
 p('El administrador configura los catálogos y los doctores. El doctor dispone su agenda. El paciente consulta los horarios, se registra e inicia sesión y confirma un turno. Luego el doctor utiliza esa reserva para registrar asistencia. React se ocupa de la interacción; Express comprueba identidad, permisos y reglas; MySQL conserva los datos.'),
 h('Cómo usar esta guía'),
 p('Primero estudiá arquitectura, modelo y autenticación. Después seguí una reserva completa y sus cambios de estado. Usá la matriz de requisitos para justificar el cumplimiento y el recorrido final para practicar la demostración. Las referencias señalan archivos y funciones concretas para abrir durante la defensa.'),
 p('Estado de la revisión: hay funcionalidad y pruebas locales, pero la aprobación directa también depende de la propuesta aceptada, la documentación, el despliegue y la entrega. La propuesta enviada por privado debe conservarse junto con la aceptación del docente; trabajar individualmente requiere su autorización.'),
 p('No presentes como terminado lo que figura como pendiente. La existencia de una ruta o de una pantalla no prueba por sí sola que un caso de uso esté completo.')])

page('Mapa de estudio', 'Orden recomendado para comprender el proyecto y explicar sus decisiones',[
 table(['Página','Tema','Qué deberías poder explicar'],[
 ['3','Requisitos técnicos','Qué evidencia cubre backend y frontend'],['4','Requisitos funcionales','CRUDs y casos de uso relacionados'],
 ['5','Arquitectura','Capas y separación por API'],['6','Modelo','Entidades y relaciones'],['7','Autenticación','Cuenta, perfil y sesión'],
 ['8','Autorización','Rol y propiedad del recurso'],['9','CRUDs','Catálogos, doctor y agenda'],['10','Disponibilidad','Cómo se generan los horarios'],
 ['11','Reserva','Validaciones antes de guardar'],['12','Estados','Cancelación y asistencia'],['13','Notificaciones','Cola, envío y reintentos'],
 ['14','Frontend','Estado, componentes y servicios'],['15','API y errores','Endpoints y códigos HTTP'],['16','Pruebas','Qué valida cada tipo de test'],
 ['17','Configuración y pendientes','Cómo ejecutar y qué falta'],['18','Demostración','Recorrido para la defensa'],['19','Preguntas posibles','Respuestas basadas en el código'],['20','Fuentes','Enunciado y mapa del código']], [45,115,335]),
 p('Lectura breve: páginas 3, 4, 5, 7, 11, 12 y 19. Lectura en detalle: documento completo. Las imágenes de pantallas son capturas locales del recorrido de verificación del 1 de octubre de 2026; contienen datos de demostración.')])

page('Correspondencia con los requisitos técnicos', 'La evidencia debe relacionar una condición del enunciado con una parte observable del proyecto',[
 table(['Área','Estado','Evidencia actual'],[
 ['Backend separado y API','Implementado','Express en app.ts y routers /api; React consume JSON.'],
 ['Base externa y mapper','Implementado','MySQL como servicio; entidades y consultas con MikroORM.'],
 ['Capas','Implementado','Archivos de rutas, controladores, entidades y utilidades compartidas.'],
 ['Validación y errores','Implementado','Validación por recurso y manejadorErrores.ts centralizado.'],
 ['Dependencias','Declaradas','package.json y lockfiles en ambos proyectos.'],
 ['Pruebas de backend','Verificado','34 tests aprobados; incluyen integración con MySQL.'],
 ['Login y niveles de acceso','Implementado','Better Auth; paciente, doctor y admin.'],
 ['Frontend con framework','Implementado','React y TypeScript; HTML semántico, MUI y Tailwind.'],
 ['Servicios y modelos','Implementado','Servicios/api.ts, servicios por recurso y Tipos/dominio.ts.'],
 ['Eventos y reactividad','Implementado','useState, useEffect, props y callbacks de componentes.'],
 ['Prueba de componente y E2E','Verificado','3 tests de Card; 10 pruebas Playwright.'],
 ['Ambientes','Implementado','Variables .env y ramas por NODE_ENV.'],
 ['SM MD LG y UX','Por completar QA','Hay estilos responsive; falta evidencia de revisión integral.']], [138,85,272]),
 p('TypeScript agrega tipos y se compila a JavaScript; el backend se ejecuta con Node.js. La organización en capas existe, aunque varios controladores contienen también lógica de negocio: no conviene afirmar que hay una capa de servicios independiente para todos los recursos.'),
 p('Estos estados describen la implementación y la verificación disponible. No sustituyen la aceptación académica de las tecnologías y del alcance. Fuente del criterio: enunciado de la cátedra, sección 3.1 [1].')])

page('Correspondencia con los requisitos funcionales', 'Una operación CRUD mantiene datos; un caso de uso combina reglas y operaciones para producir valor',[
 table(['Recurso','API','Interfaz y observaciones'],[
 ['Especialidad','CRUD','Alta, listado, modificación y eliminación administrativas.'],
 ['Obra social','CRUD','Catálogo simple usado al reservar.'],
 ['Motivo de cancelación','CRUD','Catálogo opcional para clasificar cancelaciones.'],
 ['Doctor','CRUD con baja lógica','Depende de Usuario y se relaciona con Especialidad.'],
 ['Agenda','CRUD dependiente','Pertenece a Doctor y genera horarios disponibles.'],
 ['Usuario','CRUD','Registro y perfil; falta pantalla administrativa de usuarios.'],
 ['Turno','Operaciones de negocio','Reserva, consulta, cancelación y asistencia; sin CRUD genérico.'],
 ['Notificación','Gestión interna','No requiere pantalla CRUD para el paciente.']], [115,120,260]),
 h('Casos de uso relacionados'),
 p('<b>Reservar un turno:</b> consume agenda y doctor, comprueba disponibilidad y registra una reserva pendiente. <b>Registrar asistencia:</b> consume ese turno y registra el resultado de la atención. Son dos casos relacionados porque el primero produce el dato que necesita el segundo. Cancelar un turno agrega otra operación con valor: conserva el historial y libera el horario.'),
 p('Para un integrante hay suficientes candidatos a CRUD simple y dependiente. La condición de aprobación exige al menos dos casos relacionados y cobertura de las clases de negocio; la propuesta aceptada define cómo presentar este alcance [1].'),
 h('Puntos que requieren acuerdo o ajuste'),
 p('El turno se cancela, no se elimina físicamente. Conviene justificar esta decisión y acordar con el docente si las operaciones de negocio cubren el alcance solicitado. Los listados administrativos permiten editar elementos, pero hay que revisar el criterio de detalle con consulta al backend [3]. No afirmar que todos los listados ya cumplen ese punto.'),
 src('frontend-dsw/src/Paginas/AdminCargaDatos.tsx','frontend-dsw/src/Paginas/AdminModificarDatos.tsx','backend-dsw/src/recursos/turno/turno.rutas.ts')])

page('Arquitectura y recorrido de una petición', 'Frontend y backend se comunican por un contrato HTTP y JSON',[
 pic(ARCH,'Figura 2  Dos procesos y una base externa',185),
 h('Desde el navegador hasta la base'),
 p('Una página invoca un servicio, por ejemplo reservarTurno. El servicio utiliza api.post, que envía JSON e incluye credentials: include para que viaje la cookie de sesión. En desarrollo el navegador pide /api al puerto 5173 y el proxy de Vite reenvía la solicitud al backend en el puerto 3000.'),
 p('Express identifica la ruta y ejecuta sus middlewares en orden. Primero puede comprobar sesión y rol, luego limpiar y validar la entrada y finalmente llamar al controlador. El controlador aplica las reglas del recurso y consulta o modifica entidades con MikroORM. flush materializa los cambios en MySQL y la respuesta vuelve como JSON.'),
 h('Qué hace cada capa'),
 p('<b>Ruta:</b> relaciona método y URL con permisos y función. <b>Controlador:</b> interpreta la solicitud y coordina reglas y persistencia. <b>Entidad:</b> describe propiedades, relaciones y mapeo ORM. <b>Servicio de frontend:</b> concentra llamadas HTTP. <b>Componente:</b> representa estado y atiende eventos.'),
 p('RequestContext asigna un contexto de EntityManager por petición para separar el seguimiento de entidades entre solicitudes. Las tareas y transacciones crean forks. Better Auth administra sus tablas con mysql2; las entidades de negocio usan MikroORM. Ambas persistencias apuntan a MySQL.'),
 src('backend-dsw/src/app.ts','backend-dsw/src/shared/orm.ts','frontend-dsw/src/Servicios/api.ts','frontend-dsw/vite.config.ts')])

page('Modelo de datos y relaciones', 'La identidad de acceso se vincula con el perfil utilizado por las reglas de negocio',[
 pic(MODEL,'Figura 3  Relaciones principales del modelo',190),
 p('<b>Usuario:</b> tiene ID numérico, nombre, apellido, email, rol y datos de perfil. authUserId vincula el perfil con la cuenta de Better Auth. El hash de la contraseña no está en esta entidad; las credenciales están en auth_account.'),
 p('<b>Doctor:</b> usa matrícula como clave, referencia un único Usuario y tiene activo para baja lógica. Nombre y email se leen del usuario para evitar duplicarlos. Un doctor puede tener varias especialidades y una especialidad varios doctores: relación muchos a muchos.'),
 p('<b>Agenda:</b> cada bloque pertenece a un doctor y guarda día de semana, hora inicial, hora final y duración. Puede haber varios bloques por doctor. <b>Turno:</b> referencia paciente y doctor, conserva fecha, estado y, opcionalmente, obra social y motivo de cancelación.'),
 p('<b>Notificación:</b> referencia el turno y guarda el trabajo de correo, su estado y reintentos. El diagrama resume el modelo; la relación opcional de Turno con MotivoCancelacion no está dibujada para mantener la legibilidad.'),
 h('Decisiones que podés defender'),
 p('Una agenda no es una lista de turnos ya creados: es una regla recurrente para generar posibilidades. Una reserva es un hecho concreto con fecha. La baja lógica del doctor conserva la integridad del historial. Separar cuenta y perfil permite utilizar una biblioteca de autenticación sin reemplazar las relaciones numéricas del negocio.'),
 src('backend-dsw/src/recursos/usuarios/usuario.entidad.ts','backend-dsw/src/recursos/doctor/doctor.entidad.ts','backend-dsw/src/recursos/agenda/agenda.entidad.ts','backend-dsw/src/recursos/turno/turno.entidad.ts')])

page('Registro inicio y duración de la sesión', 'El código actual usa Better Auth con sesiones persistidas y cookies',[
 pic(AUTH,'Figura 4  Autenticación y resolución del perfil',175),
 p('El registro público recibe nombre, apellido, DNI, email y contraseña mediante POST /api/usuarios. El controlador llama a signUpEmail. El plugin asigna paciente como rol predeterminado; el cliente no decide privilegios. Un hook valida los datos y crea el perfil Usuario vinculado a la cuenta.'),
 p('autoSignIn está desactivado. Tras registrarse, la página envía al login. authClient.signIn.email valida las credenciales; la biblioteca genera la sesión y su cookie HttpOnly. Luego el frontend consulta /api/usuarios/me para obtener el perfil y mostrar nombre y menú.'),
 p('La sesión dura 86.400 segundos, es decir 24 horas. disableSessionRefresh evita extenderla por actividad y cookieCache está desactivada. Al recargar, AuthContext consulta la sesión y recupera el perfil. Mientras espera, los guards muestran Cargando sesión para evitar una redirección prematura.'),
 p('Al cerrar sesión, authClient.signOut invalida la sesión en el servidor y React limpia el usuario visible. No se guarda un token nuevo en localStorage; se retiran los datos antiguos. El hash de contraseña corresponde al mecanismo predeterminado scrypt de Better Auth, según la migración implementada.'),
 h('Dos comportamientos distintos'),
 p('Si un visitante intenta reservar o abrir una ruta privada, se lo envía a /registro. Si una solicitud recibe 401 por sesión vencida, api.ts dispara un evento y AuthContext envía a /login. Después de iniciar sesión, Login navega al inicio; el retorno automático a la pantalla previa todavía no está implementado.'),
 src('backend-dsw/src/shared/auth.ts','frontend-dsw/src/Contextos/AuthContext.tsx','frontend-dsw/src/Servicios/authService.ts','frontend-dsw/src/Paginas/Login.tsx')])

page('Permisos y propiedad del recurso', 'Estar autenticado no implica poder modificar cualquier dato',[
 table(['Acción','Paciente','Doctor','Admin'],[
 ['Explorar especialidades y horarios','Sí','Sí','Sí'],['Reservar para su cuenta','Sí','Sí excepto consigo','Sí'],
 ['Ver perfil propio','Sí','Sí','Sí'],['Editar catálogo y doctores','No','No','Sí'],
 ['Administrar agenda','No','Solo propia','Cualquier doctor'],['Consultar turno individual','Solo propio','Propio o atendido','Sí'],
 ['Cancelar turno pendiente','Solo propio','Solo como dueño','Sí'],['Marcar asistencia','No','Solo turno atendido','No con rol admin'],
 ['Listar usuarios por API','No','No','Sí']], [188,87,115,105]),
 p('verificarSesion consulta Better Auth y busca el perfil vinculado. Construye req.usuario con ID de negocio y rol vigente. autorizarRoles comprueba el nivel exigido por la ruta. Los controladores agregan propiedad: una agenda debe pertenecer al doctor y la asistencia al profesional que atiende el turno.'),
 p('El frontend ofrece RutaPrivada, RutaDoctor y RutaAdmin y adapta el menú al rol. Es una ayuda para la navegación; la seguridad real se repite en el backend. Cambiar el rol en React o llamar la API directamente no evita la validación del servidor.'),
 p('Las solicitudes que modifican recursos comprueban Origin y sec-fetch-site para rechazar orígenes ajenos. CORS permite el origen configurado con credenciales. Estas medidas complementan los controles de sesión y propiedad; CORS por sí solo no es autorización.'),
 h('Ejemplo para defender'),
 p('Un doctor intenta modificar la agenda de otro: tiene una sesión válida y el rol doctor, pero la propiedad no coincide. El servidor responde 403. Los tests de integración prueban este escenario. El administrador no puede marcar asistencia con su rol actual porque esas rutas exigen doctor.'),
 src('backend-dsw/src/shared/middlewares/auth.middleware.ts','backend-dsw/src/recursos/agenda/agenda.controlador.ts','backend-dsw/src/recursos/turno/turno.rutas.ts')])

page('Cómo funcionan los CRUDs', 'Los catálogos alimentan la agenda y las operaciones sobre turnos',[
 h('Catálogos simples'),
 p('Especialidad, ObraSocial y MotivoCancelacion tienen rutas de alta, lectura, actualización y eliminación. Las escrituras requieren admin. En el frontend se administran desde Cargar datos y Modificar datos. Los IDs autoincrementales se asignan en la base, no se ingresan manualmente para una especialidad.'),
 h('Alta y baja de un doctor'),
 p('El alta comprueba que no exista email ni matrícula, la longitud de contraseña y los IDs de especialidad. Crea una cuenta con rol doctor mediante Better Auth; el hook crea Usuario. Después crea Doctor, lo vincula y asigna especialidades. Si falla el guardado del doctor, intenta retirar la cuenta recién creada como compensación.'),
 p('La modificación del doctor administra especialidades y activo. Sus datos personales pertenecen al Usuario. DELETE /doctores/:matricula cambia activo a false: no elimina doctor ni turnos. Los listados públicos y la disponibilidad dejan de ofrecerlo; el administrador puede verlo y reactivarlo.'),
 h('Agenda dependiente'),
 p('Un bloque incluye doctorId, día 0 a 6, horas HH:MM y duración positiva. Se valida la entrada y el permiso del doctor o administrador. Al editar, solo el admin puede reasignar un bloque a otro profesional. La eliminación de una agenda es física; elimina la regla de disponibilidad, no el historial de turnos.'),
 h('Límite de cobertura'),
 p('Usuario tiene operaciones CRUD en el backend y registro y edición de perfil en la interfaz, pero no hay una pantalla administrativa para listar y eliminar usuarios. Eliminar una cuenta asociada a doctor o turnos se bloquea para conservar relaciones y credenciales. Los turnos se gestionan con estados, no con un formulario de CRUD genérico.'),
 src('backend-dsw/src/recursos/doctor/doctor.controlador.ts','backend-dsw/src/recursos/agenda/agenda.controlador.ts','backend-dsw/src/recursos/usuarios/usuario.controlador.ts','backend-dsw/src/shared/auth.ts')])

page('Cómo se calcula la disponibilidad', 'Los horarios se generan a partir de los bloques semanales del profesional',[
 pic(RES,'Figura 5  Relación entre agenda disponibilidad y reserva',180),
 p('generarSlotsDelDia obtiene el día de semana de la fecha solicitada, busca los bloques de ese doctor y genera horas desde horaInicio hasta antes de horaFin, avanzando por duracionTurnoMinutos. Con un bloque de 09:00 a 10:00 y duración de 20 minutos, produce 09:00, 09:20 y 09:40.'),
 p('slotsOcupados busca los turnos pendientes del doctor en esa fecha y arma un Set de timestamps. La disponibilidad resta esos horarios a los generados. Un turno cancelado deja de ocupar el horario porque el filtro de ocupación considera únicamente pendiente.'),
 p('Por especialidad se repite el cálculo para cada doctor activo y se devuelven pares de horario y profesional. El frontend agrupa por hora: primero muestra el horario y luego deja elegir entre los doctores disponibles. Por doctor se devuelve directamente su lista de horas.'),
 p('Las rutas mensuales recorren los días y devuelven aquellos que tienen alguna posibilidad libre. Esa información pinta el calendario; al seleccionar el día se consulta su disponibilidad puntual. Ambas consultas son públicas, porque explorar horarios no crea una reserva.'),
 h('Lo que no debés prometer'),
 p('La disponibilidad actual no filtra siempre los horarios pasados al devolver la lista; el alta de la reserva sí los rechaza. El control de horarios repetidos consulta si hay un turno pendiente, pero no existe una protección atómica de reserva que garantice exclusión bajo dos solicitudes simultáneas. Es una mejora pendiente de concurrencia, no una propiedad demostrada por los tests actuales.'),
 src('backend-dsw/src/recursos/turno/turno.controlador.ts')])

page('Reserva de un turno de principio a fin', 'Caso de uso que combina sesión disponibilidad validación y persistencia',[
 p('Desde la ficha de doctor o desde una especialidad, el visitante consulta el calendario. Al intentar reservar sin sesión se redirige a Registro con un mensaje. Después de registrar la cuenta debe iniciar sesión y volver a elegir: el código guarda from en algunas redirecciones, pero no completa la restauración de fecha y horario.'),
 p('Con sesión, el usuario selecciona obra social o Sin obra social y confirma. reservarTurno envía doctorId, fechaHoraTurno y obraSocialId. El backend no recibe un usuarioId elegido por el cliente: utiliza req.usuario.id de la sesión, evitando crear la reserva a nombre de otro paciente.'),
 h('Validaciones antes del guardado'),
 p('Se verifica formato de fecha, que no esté en el pasado, existencia y actividad del doctor y que el usuario no reserve consigo mismo. El horario debe coincidir exactamente con uno generado por la agenda. Si ya hay un turno pendiente en ese horario, se responde 409. Una obra social enviada debe existir.'),
 p('El controlador crea Turno con estado pendiente y fechaHoraEmision, hace flush y responde 201 con una representación explícita del recurso. El frontend navega a Mis turnos. La serialización incluye doctor y especialidades, sin exponer las entidades de identidad ni las credenciales.'),
 pic(ROOT/'verificacion/better-auth-reserva.png','Figura 6  Reserva y sesión verificadas en el entorno local',235),
 src('frontend-dsw/src/Paginas/DoctorDetalle.tsx','frontend-dsw/src/Paginas/EspecialidadTurnos.tsx','frontend-dsw/src/Servicios/turnosService.ts','backend-dsw/src/recursos/turno/turno.controlador.ts')])

page('Cancelación asistencia e historial', 'Los cambios de estado conservan el turno y permiten relacionar los casos de uso',[
 pic(STATES,'Figura 7  Transiciones de estado implementadas',185),
 p('<b>Cancelación:</b> dueño o admin, solamente sobre pendiente. Guarda estado cancelado y fechaHoraCancelacion. El texto libre y el motivo preestablecido son opcionales. Si cancela el propio dueño se encola correo de cancelación. No se borra la fila; el historial sigue mostrándola.'),
 p('<b>Asistencia:</b> solamente el doctor del turno y mientras el turno está pendiente. El momento permitido va desde el horario del turno hasta 15 minutos después. Antes o después devuelve 409. Al confirmar, cambia a asistido y encola la notificación correspondiente.'),
 p('<b>No asistencia:</b> el doctor puede marcar manualmente un turno pendiente. La función actual no exige esperar al horario para esa marca manual. La tarea automática busca pendientes con más de 15 minutos vencidos, los actualiza en transacciones y encola notificaciones; corre cada cinco minutos y también antes de ciertas lecturas.'),
 p('Una transacción con bloqueo pesimista protege las actualizaciones de la tarea automática. No debe confundirse esta protección con la reserva: el alta de turnos no utiliza ese mismo bloqueo. Los comentarios viejos que dicen doce horas no representan la regla actual.'),
 h('Qué demuestra el caso relacionado'),
 p('La reserva crea el dato que luego el doctor usa para atender. Un estado final conserva el resultado del proceso. Mis turnos permite consultar historia y filtrar pendientes futuros; Turnos con pacientes permite al doctor operar sobre sus reservas. El backend tiene filtros adicionales de historia que todavía no aparecen como controles completos en esa pantalla.'),
 src('backend-dsw/src/recursos/turno/turno.controlador.ts','frontend-dsw/src/Paginas/MisTurnos.tsx','frontend-dsw/src/Paginas/TurnosPacientes.tsx')])

page('Notificaciones y tareas automáticas', 'Los correos se guardan como trabajos para poder reintentar su envío',[
 pic(MAIL,'Figura 8  Flujo de notificaciones persistentes',180),
 p('encolarNotificacion crea una entidad con turno, tipo, destinatario, asunto, texto, estado pendiente y próximo intento. Se persiste junto al cambio de estado. La API puede confirmar el cambio sin esperar la entrega externa del correo.'),
 p('iniciarNotificacionesTurnos comprueba RESEND_API_KEY y RESEND_FROM_EMAIL. Si faltan, muestra advertencia y no inicia el envío. Cuando están configuradas, ejecuta un ciclo inicial y otro cada minuto, evitando solapar ciclos dentro del mismo proceso.'),
 p('El ciclo prepara recordatorios para turnos pendientes dentro de las próximas 24 horas. Usa una transacción y restricción de unicidad para evitar trabajos repetidos. Luego toma hasta 100 notificaciones vencidas y las reclama con una actualización condicional: si otra instancia la tomó, no la procesa.'),
 p('La llamada a Resend usa una clave de idempotencia por turno y tipo y timeout de 15 segundos. Si funciona guarda enviado, fecha y resendId. Si falla incrementa intentos y programa una espera exponencial, limitada a 60 minutos. Un recordatorio se omite si el turno ya no está pendiente o ya pasó.'),
 h('Cómo explicarlo en la defensa'),
 p('La cola guarda la intención de envío incluso si el proveedor falla. Hay persistencia, reintentos y control de duplicados; no garantiza que el destinatario lea el mensaje. La implementación fue revisada, pero la entrega real de correos externos no quedó verificada en el recorrido local.'),
 p('Es una funcionalidad adicional. No hay un correo inmediato de confirmación de reserva en el alta actual: existen recordatorio, cancelación, asistencia y no asistencia.'),
 src('backend-dsw/src/recursos/turno/notificacionTurno.servicio.ts','backend-dsw/src/recursos/turno/notificacionTurno.entidad.ts')])

page('Frontend componentes estado y experiencia', 'React transforma acciones del usuario en cambios de estado y solicitudes al servidor',[
 h('Reactividad y eventos'),
 p('useState conserva formularios, errores, selección de horario, carga y diálogos. Un onChange actualiza el campo; un onClick elige o confirma; useEffect carga datos cuando cambia una dependencia. El resultado de una solicitud actualiza el estado y React vuelve a renderizar la pantalla.'),
 h('Props y callbacks'),
 p('Card recibe title, description y href: ejemplo de datos de entrada. CalendarioTurnos recibe fecha y fechasConTurnos; ejecuta onCambiarFecha y onCambiarMes cuando el usuario interactúa. Los formularios administrativos ejecutan onCreada u onCreado para refrescar las listas del componente padre. En React, esos callbacks cumplen el papel de comunicación del hijo al padre.'),
 h('Servicios y tipos'),
 p('api.ts concentra JSON, cookies y errores. Los servicios de doctor, agenda, turnos y usuario ofrecen funciones de negocio con tipos. Tipos/dominio.ts describe las formas de respuesta, como Doctor, Turno y UsuarioSesion. TypeScript ayuda durante el desarrollo, pero no valida automáticamente el JSON recibido en tiempo de ejecución.'),
 h('Listado con filtro y detalle'),
 p('Doctores consulta al backend por nombre y especialidad cuando cambian los filtros y conserva esos parámetros en la URL. La selección abre DoctorDetalle, que realiza una petición del doctor y muestra especialidades y calendario. Es el ejemplo más claro para demostrar listado filtrado y detalle.'),
 h('Estados visibles y adaptación'),
 p('Hay indicadores de carga, mensajes de error, estados vacíos y botones desactivados durante operaciones. MUI y Tailwind proporcionan reglas responsive y el menú cambia en móvil. Falta revisar y guardar evidencia integral en SM, MD y LG; usar una biblioteca no prueba por sí solo que toda pantalla sea correcta.'),
 p('La foto de perfil se lee como Data URL PNG y se guarda en longtext. El frontend comprueba formato y tamaño de hasta 2 MB; no conviene afirmar una validación equivalente y completa del archivo en el backend.'),
 src('frontend-dsw/src/Componentes/CalendarioTurnos.tsx','frontend-dsw/src/Paginas/doctores.tsx','frontend-dsw/src/Paginas/Perfil.tsx','frontend-dsw/src/Servicios/api.ts')])

page('API validación y manejo de errores', 'Las rutas representan recursos y operaciones; el servidor decide el resultado',[
 table(['Método y ruta','Finalidad','Acceso'],[
 ['POST /api/usuarios','Registro de paciente','Público'],['POST /api/auth/sign-in/email','Iniciar sesión','Público'],
 ['GET /api/usuarios/me','Perfil de la sesión','Autenticado'],['GET /api/doctores/:matricula','Ficha del doctor','Público con reglas de actividad'],
 ['POST /api/doctores','Crear cuenta y doctor','Admin'],['POST /api/agendas','Crear bloque semanal','Admin o doctor propio'],
 ['GET /api/turnos/disponibilidad','Horarios por doctor y fecha','Público'],['POST /api/turnos','Reservar para la sesión','Autenticado'],
 ['GET /api/turnos/mios','Historia del usuario','Autenticado'],['GET /api/turnos/atiendo','Reservas del profesional','Doctor'],
 ['PATCH /api/turnos/:id/cancelar','Cancelar pendiente','Dueño o admin'],['PATCH /api/turnos/:id/asistio','Confirmar asistencia','Doctor del turno']], [245,145,105]),
 p('La respuesta de negocio suele ser { message, data }. Los endpoints de Better Auth tienen su propio contrato. limpiarInput conserva campos permitidos; validarCamposRequeridos exige obligatorios y parsearIdNumerico rechaza IDs no numéricos. Cada recurso agrega validaciones específicas.'),
 p('<b>400:</b> entrada inválida. <b>401:</b> falta sesión o está vencida. <b>403:</b> rol, propiedad u origen no permitido. <b>404:</b> recurso inexistente. <b>409:</b> conflicto, por ejemplo horario ocupado o transición no permitida. <b>500:</b> error inesperado con mensaje general.'),
 p('Express 5 propaga los rechazos de funciones async al manejador de errores. Este traduce errores propios, de MikroORM y de Better Auth. El frontend interpreta message y muestra un Alert. El body JSON se limita a 5 MB para permitir la foto en base64; este límite no reemplaza validación del contenido.'),
 src('backend-dsw/src/shared/validacion.ts','backend-dsw/src/shared/manejadorErrores.ts','backend-dsw/src/app.ts')])

page('Pruebas y evidencia de funcionamiento', 'Cada nivel de prueba responde una pregunta distinta',[
 table(['Tipo','Herramientas','Evidencia de esta revisión'],[
 ['Unitario backend','Vitest y mocks','Validación, errores, sesión y autorización.'],
 ['Integración backend','Vitest y Supertest con MySQL','Rutas, controladores, ORM, permisos y estados.'],
 ['Componente frontend','Vitest y Testing Library','Card renderiza props y construye su enlace.'],
 ['Navegador E2E','Playwright con API interceptada','Login, recarga, validación y redirecciones.'],
 ['Recorrido real','Navegador y base local','Alta, agenda, registro, reserva y cancelación.']], [112,165,218]),
 p('La última ejecución de backend aprobó 34 tests en cinco archivos y compiló TypeScript. Frontend aprobó tres tests de componente y diez de Playwright. Ambos builds pasaron; Vite informa un bundle grande como advertencia, sin impedir compilar. Estos resultados corresponden al estado local revisado el 1 de octubre de 2026.'),
 h('Qué se prueba con integración'),
 p('Las suites verifican alta del doctor con cuenta, permisos sobre agendas, disponibilidad pública, reserva de paciente, consulta del doctor y reglas de asistencia. También comprueban que el registro público no eleve el rol, que un cambio de rol se aplique a una sesión existente y que sesiones vencidas o cerradas ya no permitan acceder.'),
 h('Cómo ejecutar las pruebas'),
 code('backend-dsw: pnpm test\nfrontend-dsw: pnpm test\nfrontend-dsw: pnpm test:e2e\nEn ambos proyectos: pnpm build'),
 p('Los E2E interceptan la API para controlar los escenarios: prueban navegación e interacción, no la integración completa con MySQL. Las pruebas de integración sí usan la base real y crean datos temporales. No existe aquí una prueba que demuestre exclusión de doble reserva simultánea ni entrega externa de correo.'),
 p('Para entregar, guardar los resultados actuales, identificar qué prueba corresponde al integrante y vincular los informes desde docs/README.md. Las capturas y los informes anteriores sirven como evidencia complementaria, no reemplazan las ejecuciones actuales.'),
 src('backend-dsw/src/recursos/turno/turno.estados.integration.test.ts','frontend-dsw/src/Componentes/Card.test.tsx','frontend-dsw/e2e/registro-rutas-privadas.spec.ts','verificacion/better-auth.md')])

page('Configuración ejecución y trabajo pendiente', 'El entorno local está preparado pero todavía no equivale a un despliegue público',[
 p('Instalar dependencias en backend-dsw y frontend-dsw con pnpm install. Configurar .env a partir de cada .env.example. MySQL debe estar activo y la base configurada. En backend, DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD conectan la persistencia; BETTER_AUTH_SECRET y APP_ORIGIN configuran autenticación.'),
 code('Backend: pnpm db:prepare y luego pnpm dev\nFrontend: pnpm dev\nNavegador local: http://localhost:5173'),
 p('db:prepare prepara el esquema de una base compatible con la migración actual. db:reset es destructivo: elimina datos y no debe usarse para iniciar una demostración. Ambos comandos de preparación actuales rechazan NODE_ENV=production. El admin se crea por un comando local auth:admin con variables ADMIN_*; no hay endpoint público de creación inicial.'),
 p('En producción no se actualiza el esquema automáticamente al arrancar. Hace falta definir el procedimiento de creación y migración, el reverse proxy de /api o una configuración equivalente, HTTPS, la base accesible y las variables del entorno. No alternar localhost y 127.0.0.1 en desarrollo: son orígenes distintos para las cookies.'),
 table(['Pendiente','Qué hacer antes de entregar'],[
 ['Documentación','README principal, docs/README.md, modelo y propuesta aceptada.'],['API','Referencia de endpoints con ejemplos y permisos.'],
 ['Gestión','Minutas, metodología y seguimiento del trabajo individual.'],['Entrega','Video, PR, evidencias, URL pública y cuentas de demo.'],
 ['Funcionalidad','Pantalla administrativa de usuarios y revisión del detalle de listados.'],['QA y robustez','Tres breakpoints; revisar concurrencia de reservas y validación de datos.'],
 ['Recuperación de contraseña','Implementar envío real o retirar la promesa visible si queda fuera de alcance.']], [140,355]),
 p('El documento requerimientos-funcionales.txt describe una versión anterior: JWT, bcrypt, sanatorios y motivos obligatorios no representan el código actual. Debe actualizarse. Las condiciones de entrega se encuentran en [1] y la estructura documental en [2].'),
 src('backend-dsw/.env.example','frontend-dsw/.env.example','backend-dsw/src/shared/preparar-db.ts')])

page('Recorrido para practicar la defensa', 'Una demostración breve debe mostrar el valor del negocio y un rechazo de permisos',[
 p('<b>1. Presentar el problema:</b> organizar disponibilidad y reservas con historial. Mostrar la separación frontend, API y base. Abrir el diagrama y ubicar app.ts, rutas, controlador y entidad.'),
 p('<b>2. Entrar como administrador:</b> mostrar catálogos y un doctor con especialidad. Explicar la baja lógica sin ejecutarla sobre datos necesarios para la demo. Usar datos de prueba, no cuentas o información personal real.'),
 p('<b>3. Entrar como doctor:</b> crear un bloque de agenda y explicar día, horario y duración. No confundir ese bloque con una reserva. Elegir una fecha futura que coincida con el día del bloque.'),
 p('<b>4. Salir y explorar:</b> consultar disponibilidad sin sesión. Intentar reservar y mostrar la redirección a Registro. Registrar un paciente e iniciar sesión; volver a elegir el horario porque el retorno de la selección no está implementado.'),
 p('<b>5. Reservar:</b> elegir obra social o Sin obra social. Confirmar y recargar Mis turnos para probar persistencia y restauración de sesión. Explicar que el usuario de la reserva surge de la sesión del servidor.'),
 p('<b>6. Cancelar:</b> mostrar cambio a Cancelado e historial; volver a consultar disponibilidad. Como alternativa, mostrar en tests la atención: la asistencia exige un horario dentro de los 15 minutos y no se puede forzar con cualquier fecha.'),
 p('<b>7. Mostrar seguridad y tests:</b> acceder a una ruta admin desde un paciente y explicar el rechazo del backend. Enseñar salida de pnpm test y un caso de integración. No editar fechas ni permisos reales solo para hacer pasar una demo.'),
 pic(ROOT/'verificacion/better-auth-cancelacion.png','Figura 9  Cancelación conservada en el historial local',205),
 p('Prepará cuentas separadas y datos de demostración antes de presentar. La prueba de asistencia puede explicarse con la suite automatizada si no coincide la ventana horaria durante la defensa.')])

page('Preguntas posibles y respuestas', 'Respuestas breves que podés ampliar mostrando el código',[
 h('Por qué usar React y Express separados'),
 p('El frontend representa interacción y el backend aplica reglas y persistencia. Se comunican por HTTP y JSON. Podría cambiar la interfaz sin reemplazar el modelo de negocio si mantiene el contrato de la API.'),
 h('Por qué usar un ORM'),
 p('MikroORM relaciona clases y tablas, permite consultar entidades y administra sus relaciones y cambios. MySQL sigue siendo la base persistente externa. flush escribe los cambios; el ORM no elimina la necesidad de validación o de resolver concurrencia.'),
 h('Autenticación y autorización significan lo mismo'),
 p('Autenticación verifica quién está conectado. Autorización decide si puede hacer la operación. El doctor puede estar autenticado y recibir 403 al intentar editar una agenda ajena.'),
 h('Dónde se guarda la contraseña y la sesión'),
 p('Better Auth administra el hash en auth_account y las sesiones en auth_session. El navegador conserva la cookie de acceso HttpOnly. Usuario es el perfil del negocio y no almacena una contraseña propia.'),
 h('Por qué no se borra el doctor ni el turno cancelado'),
 p('Los turnos históricos necesitan seguir identificando al profesional. El doctor se desactiva y la cancelación cambia el estado del turno. Así se conserva la historia y se deja de ofrecer la reserva.'),
 h('Qué evita una reserva inválida'),
 p('El servidor comprueba sesión, profesional activo, fecha futura, pertenencia a agenda y ausencia de un pendiente en ese horario. La exclusión bajo solicitudes simultáneas todavía necesita una garantía atómica; no afirmaría que está resuelta.'),
 h('Qué pasa si falla el correo'),
 p('La notificación queda persistida y se reintenta con espera creciente. El resultado del turno ya está guardado. La confirmación de Resend no demuestra lectura del destinatario.'),
 h('Qué falta para afirmar aprobación directa'),
 p('Comparar el alcance con la propuesta aceptada, completar documentación, deploy, entrega y los puntos funcionales pendientes. Las pruebas locales demuestran escenarios concretos; no garantizan todos los requisitos ni reemplazan la evaluación del docente.')])

page('Fuentes y mapa del código', 'Referencias para verificar las afirmaciones y preparar la explicación oral',[
 p('<b>[1] Enunciado:</b> <link href="https://github.com/utnfrrodsw/tp">github.com/utnfrrodsw/tp</link>. Secciones 3.1, 3.2 y 3.3: requisitos técnicos, funcionales y entrega.'),
 p('<b>[2] Documentación:</b> <link href="https://github.com/utnfrrodsw/tp/blob/main/docs.md">github.com/utnfrrodsw/tp/blob/main/docs.md</link>. Estructura y contenido de docs.'),
 p('<b>[3] FAQ:</b> <link href="https://github.com/utnfrrodsw/tp/blob/main/FAQ.md">github.com/utnfrrodsw/tp/blob/main/FAQ.md</link>. CRUD, detalle, trabajo individual y aprobación de tecnologías.'),
 p('<b>[4] Plantilla de propuesta:</b> <link href="https://github.com/utnfrrodsw/tp/blob/main/proposal.md">github.com/utnfrrodsw/tp/blob/main/proposal.md</link>. Conservar por separado la versión enviada y aceptada.'),
 table(['Para explicar','Abrir en el proyecto'],[
 ['Montaje de API y tareas','backend-dsw/src/app.ts'],['Sesión y sincronización de perfil','backend-dsw/src/shared/auth.ts'],
 ['Permisos por sesión y rol','backend-dsw/src/shared/middlewares/auth.middleware.ts'],['MySQL y contexto ORM','backend-dsw/src/shared/orm.ts'],
 ['Disponibilidad reserva y estados','backend-dsw/src/recursos/turno/turno.controlador.ts'],['Entrega de correos','backend-dsw/src/recursos/turno/notificacionTurno.servicio.ts'],
 ['Sesión visible y cierre','frontend-dsw/src/Contextos/AuthContext.tsx'],['HTTP y errores de frontend','frontend-dsw/src/Servicios/api.ts'],
 ['Reservas desde la pantalla','frontend-dsw/src/Paginas/DoctorDetalle.tsx y EspecialidadTurnos.tsx'],['Permisos y estados verificados','backend-dsw/src/recursos/turno/turno.estados.integration.test.ts'],
 ['Redirecciones verificadas','frontend-dsw/e2e/registro-rutas-privadas.spec.ts']], [140,355]),
 p('Las referencias al código y las capturas pertenecen al workspace TP-dsw-2026 revisado el 1 de octubre de 2026. Los números de línea en las páginas técnicas son ayudas para esta versión y pueden cambiar al editar. Esta guía sirve para estudiar; no reemplaza la documentación de entrega ni certifica aprobación.')])

assert len(PAGES)==20
pdf=OUT/'Guia de defensa Hospital Ripper.pdf'
W,H=595.276,841.89; M=50; CW=W-2*M
c=canvas.Canvas(str(pdf),pagesize=(W,H))
c.setTitle('Guía de defensa del sistema de turnos médicos')
c.setAuthor('Guía de estudio del TP DSW 2026')
body=ParagraphStyle('body',fontName='Guide',fontSize=10.4,leading=14.9,textColor=colors.HexColor(INK),spaceAfter=9)
small=ParagraphStyle('small',parent=body,fontSize=8.3,leading=11,textColor=colors.HexColor(GRAY))
head=ParagraphStyle('head',parent=body,fontName='GuideBold',fontSize=12.3,leading=16,textColor=colors.black)
title=ParagraphStyle('title',parent=head,fontSize=23,leading=28)
cell=ParagraphStyle('cell',parent=body,fontSize=8.8,leading=11.8,spaceAfter=0)
chead=ParagraphStyle('chead',parent=cell,fontName='GuideBold',textColor=colors.white)

def draw_para(text,style,y):
    para=Paragraph(text,style); _,height=para.wrap(CW,700)
    para.drawOn(c,M,y-height); return y-height-style.spaceAfter

def source_text(paths):
    lines=[]
    for path in paths:
        txt=(ROOT/path).read_text(encoding='utf-8-sig')
        anchors={'auth.ts':'export const auth', 'auth.middleware.ts':'async function cargarSesion', 'turno.controlador.ts':'async function add', 'doctor.controlador.ts':'async function add', 'agenda.controlador.ts':'async function add', 'api.ts':'async function request', 'orm.ts':'export const orm'}
        anchor=anchors.get(Path(path).name)
        number=next((i for i,l in enumerate(txt.splitlines(),1) if anchor and anchor in l),1)
        lines.append(html.escape(path)+f' · línea {number}')
    return '<br/>'.join(lines)

for num,(name,intro,blocks) in enumerate(PAGES,1):
    c.bookmarkPage(f'p{num}'); c.addOutlineEntry(name,f'p{num}',0,False)
    c.setFont('Guide',8); c.setFillColor(colors.HexColor(GRAY))
    c.drawString(M,H-30,'HOSPITAL RIPPER  |  GUÍA DE DEFENSA')
    y=H-57
    y=draw_para(html.escape(name),title,y)-8
    if intro: y=draw_para(html.escape(intro),small,y)-9
    for block in blocks:
        if block[0]=='p': y=draw_para(block[1],body,y)
        elif block[0]=='h': y-=5; y=draw_para(block[1],head,y)-1
        elif block[0]=='code':
            y=draw_para(html.escape(block[1]).replace('\n','<br/>'),small,y)-7
        elif block[0]=='image':
            path,caption,maxh=block[1:]; im=Image.open(path)
            ih=min(maxh,CW*im.height/im.width); iw=ih*im.width/im.height
            c.drawImage(str(path),M+(CW-iw)/2,y-ih,width=iw,height=ih)
            y-=ih+8; y=draw_para(html.escape(caption),small,y)-7
        elif block[0]=='table':
            headers,rows,widths=block[1:]; widths=widths or [CW/len(headers)]*len(headers)
            widths=[a*CW/sum(widths) for a in widths]
            data=[[Paragraph(html.escape(str(v)),chead) for v in headers]]+[[Paragraph(html.escape(str(v)),cell) for v in row] for row in rows]
            t=Table(data,colWidths=widths,hAlign='LEFT')
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor(INK)),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#F3F6F8')]),('GRID',(0,0),(-1,-1),.5,colors.HexColor('#D9D9D9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
            _,th=t.wrap(CW,700); t.drawOn(c,M,y-th); y-=th+14
        elif block[0]=='source': y=draw_para('<b>Código para mostrar</b><br/>'+source_text(block[1]),small,y)-4
    if y<51: raise RuntimeError(f'Página {num} desborda: y={y:.1f}')
    c.setFillColor(colors.HexColor(GRAY)); c.setFont('Guide',8)
    c.drawString(M,28,'Estado local revisado el 1 de octubre de 2026')
    c.drawRightString(W-M,28,f'{num} / {len(PAGES)}')
    c.showPage()
c.save()
r=PdfReader(str(pdf)); assert len(r.pages)==20
assert all(len(pg.extract_text())>300 for pg in r.pages)
print(f'PDF creado: {pdf} | {len(r.pages)} páginas')
