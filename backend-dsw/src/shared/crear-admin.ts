import { auth, authPool } from './auth.js';
import { orm } from './orm.js';

try {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password, ADMIN_NOMBRE: name,
    ADMIN_APELLIDO: apellido, ADMIN_DNI: dni } = process.env;
  if (!email || !password || !name || !apellido || !dni) throw new Error('Definí ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE, ADMIN_APELLIDO y ADMIN_DNI');
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres');
  // Invocación local de servidor: no se publica un endpoint para crear admins sin sesión.
  await auth.api.createUser({ body: { email, password, name, role: 'admin', data: { apellido, dni } } });
  console.log('Administrador creado. Podés iniciar sesión desde la aplicación.');
} finally {
  await authPool.end();
  await orm.close();
}
