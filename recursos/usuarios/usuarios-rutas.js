const express = require('express');
const router = express.Router();
express(express.json()); // Middleware para parsear JSON en el cuerpo de las solicitudes

//esto representaría la base de datos
const usuarios = [{
    id: 1,
    nombre: 'Inservible',
    email: 'pasamelabotella@gmail.com'
}];

//Muestro todos los usuarios
router.get('/', (req, res) => {
    res.json(usuarios);
});

//Muestro 1 usuario específico
router.get('/:id', (req, res) => {
    res.send('Usuario con id: ' + req.params.id);
});

//Crear usuario (solo muestra un mensaje de que se creó el usuario, no lo crea realmente)
router.post('/crear', (req, res) => {
});

//Actualizar usuario (solo muestra un mensaje de que se actualizó el usuario, no lo actualiza realmente)
router.put('/actualizar/:id', (req, res) => {
    res.send('Usuario con id: ' + req.params.id + ' actualizado');
});

//Eliminar usuario (solo muestra un mensaje de que se eliminó el usuario, no lo elimina realmente)
router.delete('/eliminar/:id', (req, res) => {
    res.send('Usuario con id: ' + req.params.id + ' eliminado');
});

module.exports = router;