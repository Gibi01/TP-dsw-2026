const express = require('express');
const morgan = require('morgan');
const app = express();

//importo las rutas de usuarios
const usuarioRutas = require('./recursos/usuarios/usuarios-rutas');



//Logger
app.use(morgan('dev'));

//le digo a la app que use las rutas de usuarios para cualquier ruta que empiece con /usuarios
app.use('/usuarios', usuarioRutas);

app.get('/', (req, res) => {
    res.send('Funciona por ahora');
});

app.post('/', (req, res) => {
    res.send('Funciona por ahora');
});


app.listen(3000);
console.log('App andando a tope')