import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../Contextos/AuthContext';
import type { UsuarioSesion } from '../Tipos/dominio';

interface PaginaSimple {
  text: string;
  path: string;
}

interface PaginaConSubmenu {
  text: string;
  submenu: PaginaSimple[];
}

type PaginaNav = PaginaSimple | PaginaConSubmenu;

function esSubmenu(pagina: PaginaNav): pagina is PaginaConSubmenu {
  return "submenu" in pagina;
}

// el doctor tiene turnos propios como paciente y turnos que atiende, por eso "Mis turnos"
// es un submenu con las dos vistas. "Mi agenda" (sus horarios) va aparte. para los demas
// roles "Mis turnos" es un link directo nomas
function construirPaginas(usuario: UsuarioSesion | null): PaginaNav[] {
  const base: PaginaNav[] = [
    { text: "Inicio", path: "/" },
    { text: "Especialidades", path: "/reserva" },
    { text: "Especialistas", path: "/doctores" },
  ];

  if (usuario?.rol === "doctor") {
    return [
      ...base,
      {
        text: "Mis turnos",
        submenu: [
          { text: "Mis turnos", path: "/mis-turnos" },
          { text: "Turnos con pacientes", path: "/mis-turnos/atender" },
        ],
      },
      { text: "Mi agenda", path: "/mi-agenda" },
    ];
  }

  return [...base, { text: "Mis turnos", path: "/mis-turnos" }];
}

const opcionesInvitado = [
  { text: "Iniciar sesión", path: "/login" },
  { text: "Registrarme", path: "/registro" },
];

function NavSubmenu({
  pagina,
  onNavigate,
}: {
  pagina: PaginaConSubmenu;
  onNavigate: (path: string) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ my: 2, color: 'white', display: 'block' }}
        endIcon={<ArrowDropDownIcon />}
      >
        {pagina.text}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {pagina.submenu.map((opcion) => (
          <MenuItem
            key={opcion.path}
            onClick={() => {
              setAnchorEl(null);
              onNavigate(opcion.path);
            }}
          >
            {opcion.text}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function ResponsiveAppBar() {

  const navigate = useNavigate();
  const { usuario, estaAutenticado, cerrarSesion } = useAuth();
  const pages = React.useMemo(() => construirPaginas(usuario), [usuario]);

  // estado de los menus (nav y usuario)
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigateTo = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
    handleCloseUserMenu();
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    handleCloseUserMenu();
    navigate("/");
  };

  return (
    <AppBar position="static"   sx={{backgroundColor: "#8d6700"}}>
      <Container maxWidth="xl" >
        <Toolbar disableGutters>
          <LocalHospitalIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1}} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HOSPITAL RIPPER
          </Typography>
            
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} >
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.flatMap((page) =>
                esSubmenu(page)
                  ? page.submenu.map((opcion) => (
                      <MenuItem key={opcion.path} onClick={() => handleNavigateTo(opcion.path)}>
                        <Typography sx={{ textAlign: 'center' }}>{opcion.text}</Typography>
                      </MenuItem>
                    ))
                  : [
                      <MenuItem key={page.text} onClick={() => handleNavigateTo(page.path)}>
                        <Typography sx={{ textAlign: 'center' }}>{page.text}</Typography>
                      </MenuItem>,
                    ]
              )}
            </Menu>
          </Box>
          <LocalHospitalIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HOSPITAL RIPPER
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) =>
              esSubmenu(page) ? (
                <NavSubmenu key={page.text} pagina={page} onNavigate={handleNavigateTo} />
              ) : (
                <Button
                  key={page.text}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.text}
                </Button>
              )
            )}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={estaAutenticado ? `${usuario!.nombre} ${usuario!.apellido}` : "Iniciar sesión"}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={estaAutenticado ? `${usuario!.nombre} ${usuario!.apellido}` : "Invitado"}
                  src={estaAutenticado ? usuario!.foto || "/Avatar_default.jpg" : undefined}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {estaAutenticado
                ? [
                    <MenuItem key="mi-perfil" onClick={() => handleNavigateTo('/perfil')}>
                      <Typography sx={{ textAlign: 'center' }}>Mi Perfil</Typography>
                    </MenuItem>,
                    ...(usuario?.rol === 'admin'
                      ? [
                          <MenuItem key="cargar-datos" onClick={() => handleNavigateTo('/admin/carga')}>
                            <Typography sx={{ textAlign: 'center' }}>Cargar datos</Typography>
                          </MenuItem>,
                          <MenuItem key="modificar-datos" onClick={() => handleNavigateTo('/admin/modificar')}>
                            <Typography sx={{ textAlign: 'center' }}>Modificar datos</Typography>
                          </MenuItem>,
                        ]
                      : []),
                    <MenuItem key="cerrar-sesion" onClick={handleCerrarSesion}>
                      <Typography sx={{ textAlign: 'center' }}>Cerrar sesión</Typography>
                    </MenuItem>,
                  ]
                : opcionesInvitado.map((opcion) => (
                    <MenuItem key={opcion.text} onClick={() => handleNavigateTo(opcion.path)}>
                      <Typography sx={{ textAlign: 'center' }}>{opcion.text}</Typography>
                    </MenuItem>
                  ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;