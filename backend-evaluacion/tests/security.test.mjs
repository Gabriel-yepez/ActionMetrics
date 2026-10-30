/**
 * Pruebas de seguridad de la API (autorización, archivos, tokens).
 * Requieren una base de datos recién inicializada (db/setup.js) y un super admin:
 *
 *   SUPERADMIN_PASSWORD=... node db/crear-superadmin.js root root@empresa.com Root Admin 999
 *   API_URL=http://127.0.0.1:4001 SUPERADMIN_USER=root SUPERADMIN_PASSWORD=... node tests/security.test.mjs
 */
const B = process.env.API_URL || 'http://127.0.0.1:4001';
const SUPERADMIN_USER = process.env.SUPERADMIN_USER || 'root';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
if (!SUPERADMIN_PASSWORD) { console.error('Falta SUPERADMIN_PASSWORD'); process.exit(1); }
let pass = 0, fail = 0;
const check = (name, cond, extra='') => { cond ? pass++ : fail++; console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); };

class Client {
  constructor() { this.cookie = ''; }
  async req(method, path, body, isForm=false) {
    const headers = {};
    if (this.cookie) headers.cookie = this.cookie;
    if (body && !isForm) headers['content-type'] = 'application/json';
    const r = await fetch(B + path, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc && sc.startsWith('token=') && !sc.startsWith('token=;')) this.cookie = sc.split(';')[0];
    const ct = r.headers.get('content-type') || '';
    const data = ct.includes('json') ? await r.json() : await r.arrayBuffer();
    return { status: r.status, data, headers: r.headers };
  }
  login(u, p) { return this.req('POST', '/api/auth/login', { nombre_usuario: u, password: p }); }
}
const pw = 'Clave12345';
const root = new Client(); await root.login(SUPERADMIN_USER, SUPERADMIN_PASSWORD);
const dA = (await root.req('POST', '/api/departamentos', { nombre: 'Ventas' })).data.data.id;
const dB = (await root.req('POST', '/api/departamentos', { nombre: 'Soporte' })).data.data.id;
const mk = async (u, rol, dep) => (await root.req('POST', '/api/usuarios', { nombre_usuario: u, password: pw, nombre: u, apellido: 'Test', email: `${u}@x.com`, ci: Math.floor(Math.random()*1e7)+1, id_rol: rol, id_departamento: dep })).data.data;
await mk('adminA', 1, dA); await mk('adminB', 1, dB);

// 1. Registro público con id_rol=3
const reg = await new Client().req('POST', '/api/auth/register', { nombre_usuario: 'empA1', password: pw, nombre: 'Emp', apellido: 'Uno', email: 'e1@x.com', ci: 111, id_rol: 3, id_departamento: dA });
check('Registro público ignora id_rol=3 (queda empleado)', reg.data.data?.id_rol === 2, `id_rol=${reg.data.data?.id_rol}`);
check('Registro no devuelve el hash', !('password' in (reg.data.data||{})));
await new Client().req('POST', '/api/auth/register', { nombre_usuario: 'empA2', password: pw, nombre: 'Emp', apellido: 'Dos', email: 'e2@x.com', ci: 222, id_departamento: dA });
await new Client().req('POST', '/api/auth/register', { nombre_usuario: 'empB1', password: pw, nombre: 'Emp', apellido: 'Tres', email: 'e3@x.com', ci: 333, id_departamento: dB });
await new Client().req('POST', '/api/auth/register', { nombre_usuario: 'sinDep', password: pw, nombre: 'Sin', apellido: 'Dep', email: 'e4@x.com', ci: 444 });

const [adminA, adminB, empA1, empA2, empB1, sinDep] = await Promise.all(['adminA','adminB','empA1','empA2','empB1','sinDep'].map(async u => { const c = new Client(); const r = await c.login(u, pw); c.id = r.data.data.id; return c; }));

// 2. Login: mismo mensaje usuario inexistente / contraseña incorrecta
const l1 = await new Client().login('noexiste', 'x'); const l2 = await new Client().login('empA1', 'malaclave');
check('Login no revela si el usuario existe', l1.status === l2.status && l1.data.message === l2.data.message, `${l1.status} "${l1.data.message}"`);

// 3. Listado de usuarios
const uA1 = await empA1.req('GET', '/api/usuarios');
check('Ningún listado expone password', !JSON.stringify(uA1.data).includes('password') && !JSON.stringify((await root.req('GET','/api/usuarios')).data).includes('"password"'));
check('Empleado solo ve su departamento y sin email/cédula', uA1.data.data.every(u => u.id_departamento === dA && !('email' in u) && !('ci' in u)), `${uA1.data.data.length} usuarios`);
const uSin = await sinDep.req('GET', '/api/usuarios');
check('Usuario sin departamento no ve a todos', uSin.status === 404, `status ${uSin.status}`);

// Datos cifrados en la BD: la API los devuelve legibles y la búsqueda sigue funcionando
const fichaA1 = (await root.req('GET', `/api/usuarios/${empA1.id}`)).data.data || {};
check('API devuelve los datos sensibles descifrados', fichaA1.nombre === 'Emp' && fichaA1.apellido === 'Uno' && fichaA1.email === 'e1@x.com' && fichaA1.ci === 111, JSON.stringify({ n: fichaA1.nombre, e: fichaA1.email, ci: fichaA1.ci }));
const buscar = async (c, q) => { const r = await c.req('GET', `/api/usuarios?search=${encodeURIComponent(q)}`); return r.status === 200 ? r.data.data.map(u => u.nombre_usuario).sort() : []; };
check('Búsqueda por apellido sobre datos cifrados', JSON.stringify(await buscar(adminA, 'uNo')) === JSON.stringify(['empA1']));
check('Búsqueda por email (admin)', JSON.stringify(await buscar(adminA, 'e2@x')) === JSON.stringify(['empA2']));
check('Empleado no puede buscar por email', (await buscar(empA1, 'e2@x')).length === 0);
check('Búsqueda trata % y _ como texto', (await buscar(adminA, '%')).length === 0);

// 4-5. Gestión de usuarios entre departamentos / escalada
check('Empleado A no ve usuario de B por id', (await empA1.req('GET', `/api/usuarios/${empB1.id}`)).status === 403);
check('Admin A no ve usuario de B por id', (await adminA.req('GET', `/api/usuarios/${empB1.id}`)).status === 403);
check('Admin A no crea super admin', (await adminA.req('POST', '/api/usuarios', { nombre_usuario: 'malo', password: pw, nombre: 'ma', apellido: 'lo', email: 'm@x.com', ci: 5, id_rol: 3 })).status === 403);
check('Admin A no se asciende a super admin', (await adminA.req('PUT', `/api/usuarios/${adminA.id}`, { id_rol: 3 })).status === 403);
check('Admin A no edita usuario de B', (await adminA.req('PUT', `/api/usuarios/${empB1.id}`, { nombre: 'hack' })).status === 403);
check('Admin A no borra al super admin', (await adminA.req('DELETE', `/api/usuarios/${root.id ?? 1}`)).status === 403);
const edit = await adminA.req('PUT', `/api/usuarios/${empA2.id}`, { nombre: 'Editado', id_departamento: dB });
check('Admin A edita a su empleado pero no lo mueve de departamento', edit.status === 200 && edit.data.data.id_departamento === dA);
check('Empleado no puede crear usuarios', (await empA1.req('POST', '/api/usuarios', { nombre_usuario: 'x1', password: pw, nombre: 'xx', apellido: 'yy', email: 'x@x.com', ci: 6, id_rol: 2 })).status === 403);

// Objetivos
const obj = async (c, u, tipo) => (await c.req('POST', '/api/objetivos', { descripcion: `obj ${u} t${tipo}`, fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31', id_usuario: u, id_tipo_objetivo: tipo, estado_actual: 'no completado', estado_deseado: 'completado' })).data.data;
const oA1 = await obj(adminA, empA1.id, 2), oA2 = await obj(adminA, empA2.id, 2), gA2 = await obj(adminA, empA2.id, 1), oB1 = await obj(adminB, empB1.id, 2);
check('Admin A no asigna objetivos a usuarios de B', (await adminA.req('POST', '/api/objetivos', { descripcion: 'x', fecha_inicio: '2026-01-01', fecha_fin: '2026-12-31', id_usuario: empB1.id, id_tipo_objetivo: 2, estado_deseado: 'completado' })).status === 403);
check('Admin crea objetivos en su departamento', !!(oA1 && oA2 && gA2 && oB1));
if (oA1 && oA2 && gA2 && oB1) {
  const lo = (await empA1.req('GET', '/api/objetivos')).data.data.map(o => o.id).sort();
  check('Empleado ve sus objetivos + grupales de su depto (no individuales ajenos)', JSON.stringify(lo) === JSON.stringify([oA1.id, gA2.id].sort()), `ve ${lo}`);
  check('Empleado A no lee objetivo individual de A2', (await empA1.req('GET', `/api/objetivos/${oA2.id}`)).status === 403);
  check('Empleado A no completa objetivo de B', (await empA1.req('PUT', `/api/objetivos/${oB1.id}`, { estado_actual: 'completado' })).status === 403);
  check('Empleado A completa objetivo grupal de su depto', (await empA1.req('PUT', `/api/objetivos/${gA2.id}`, { estado_actual: 'completado' })).status === 200);
  check('Estado de objetivo arbitrario rechazado', (await empA1.req('PUT', `/api/objetivos/${oA1.id}`, { estado_actual: 'hackeado' })).status === 400);

  // Documentos
  const up = async (c, objetivoId, name, type, content='%PDF-1.4\n') => { const f = new FormData(); f.append('document', new Blob([content], { type }), name); f.append('objetivoId', String(objetivoId)); return c.req('POST', '/api/documentos', f, true); };
  const ok = await up(empA1, oA1.id, 'evidencia.pdf', 'application/pdf');
  check('Empleado sube documento a su objetivo', ok.status === 201 && !('path' in ok.data.data), ok.data.data?.fileName);
  check('HTML disfrazado de imagen rechazado (XSS)', (await up(empA1, oA1.id, 'x.html', 'image/png', '<script>alert(1)</script>')).status === 400);
  check('Subir a objetivo de otro depto rechazado', (await up(empA1, oB1.id, 'a.pdf', 'application/pdf')).status === 403);
  check('objetivoId con path traversal rechazado', (await up(empA1, '../../../app/x', 'a.pdf', 'application/pdf')).status === 400);
  const file = ok.data.data.fileName;
  check('Documento sin sesión → 401', (await new Client().req('GET', `/document/${file}`)).status === 401);
  check('Documento visto por empleado de B → 404', (await empB1.req('GET', `/document/${file}`)).status === 404);
  const own = await empA1.req('GET', `/document/${file}`);
  check('Documento visto por su dueño → 200 + frame-ancestors', own.status === 200 && (own.headers.get('content-security-policy')||'').includes('frame-ancestors') && !own.headers.get('x-frame-options'));
  check('Admin A ve el documento de su empleado', (await adminA.req('GET', `/document/${file}`)).status === 200);
  check('Listado de documentos de B no incluye los de A', !(await empB1.req('GET', '/api/documentos')).data.data.some(d => d.fileName === file));
  check('Borrado con path traversal rechazado', [400, 404].includes((await adminA.req('DELETE', '/api/documentos/..%2F..%2Findex.js')).status));
}

// Reportes / evaluaciones
const rep = { id_usuario: empA1.id, fecha: '2026-10-15', comentarioEvaluacion: 'Bien', comentarioHabilidad: 'Ok', objetivos_usuario: [], puntuacion: '4', responses: { 'Comunicación': 'Bueno' } };
check('Empleado no genera reportes', (await empA1.req('POST', '/api/reportes', rep)).status === 403);
check('Admin B no genera reporte de usuario de A', (await adminB.req('POST', '/api/reportes', rep)).status === 403);
check('Fecha con path traversal rechazada', (await adminA.req('POST', '/api/reportes', { ...rep, fecha: '../../../../tmp/x' })).status === 400);
check('Objeto inyectado en el PDF rechazado', (await adminA.req('POST', '/api/reportes', { ...rep, responses: { a: { image: '/etc/passwd' } } })).status === 400);
const r = await adminA.req('POST', '/api/reportes', rep);
check('Admin A genera reporte de su empleado (PDF)', r.status === 200 && r.headers.get('content-type') === 'application/pdf');
const ev = await adminA.req('POST', '/api/evaluaciones', { reportId: r.headers.get('x-report-id') });
check('Admin A crea la evaluación', ev.status === 201);
const evId = ev.data.data.evaluacion.id, url = ev.data.data.reportUrl;
check('Reporte PDF sin sesión → 401', (await new Client().req('GET', url)).status === 401);
check('Reporte PDF visto por compañero A2 → 404', (await empA2.req('GET', url)).status === 404);
check('Reporte PDF visto por admin B → 404', (await adminB.req('GET', url)).status === 404);
check('Reporte PDF visto por el evaluado → 200', (await empA1.req('GET', url)).status === 200);
check('Compañero no ve evaluaciones ajenas', (await empA2.req('GET', '/api/evaluaciones')).status === 404);
check('Evaluado ve su evaluación', (await empA1.req('GET', '/api/evaluaciones')).data.data?.length === 1);
check('Estadísticas de otro usuario → 403', (await empA2.req('GET', `/api/evaluaciones/grafica/${empA1.id}`)).status === 403);

// Retroalimentación
check('Comentar evaluación ajena → 403', (await empA2.req('POST', '/api/retroalimentacion', { comentario: 'x', id_usuario: empA1.id, id_evaluacion: evId })).status === 403);
const rt = await empA1.req('POST', '/api/retroalimentacion', { comentario: 'Gracias', id_usuario: empA2.id, id_evaluacion: evId });
check('Comentario propio: autor forzado al usuario autenticado', rt.status === 201 && rt.data.data.id_usuario === empA1.id);
check('Editar comentario ajeno → 403', (await empA2.req('PUT', `/api/retroalimentacion/${rt.data.data.id}`, { comentario: 'hack' })).status === 403);
const upd = await empA1.req('PUT', `/api/retroalimentacion/${rt.data.data.id}`, { comentario: 'Editado', id_usuario: empA2.id, id_evaluacion: 999 });
check('Edición solo cambia el comentario', upd.status === 200 && upd.data.data.id_usuario === empA1.id && upd.data.data.id_evaluacion === evId);
check('Habilidades: compañero no ve resultados ajenos', ((await empA2.req('GET', '/api/habilidades')).data.data || []).length === 0);

// Tokens
const none = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url') + '.' + Buffer.from(JSON.stringify({ id: 1, id_rol: 3 })).toString('base64url') + '.';
const forged = new Client(); forged.cookie = 'token=' + none;
check('Token con alg=none rechazado', (await forged.req('GET', '/api/usuarios')).status === 401);
await root.req('DELETE', `/api/usuarios/${empB1.id}`);
check('Token de usuario eliminado deja de funcionar', (await empB1.req('GET', '/api/auth/me')).status === 401);

console.log(`\n${pass} OK, ${fail} FAIL`);
if (fail > 0 || pass === 0) process.exit(1);
