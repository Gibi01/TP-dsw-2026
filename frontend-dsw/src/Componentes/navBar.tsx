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

  if (usuario?.rol === "admin") {
    return [
      ...base,
      { text: "Mis turnos", path: "/mis-turnos" },
      { text: "Cargar datos", path: "/admin/carga" },
      { text: "Modificar datos", path: "/admin/modificar" },
      { text: "Ver usuarios", path: "/admin/usuarios" },
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
        sx={{ color: 'white', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 48 }}
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

  const handleCerrarSesion = async () => {
    try {
      await cerrarSesion();
      handleCloseUserMenu();
      navigate("/");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo cerrar la sesión');
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'primary.main', top: 0 }}>
      <Container maxWidth="xl" >
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, lg: 80 }, gap: 1, alignItems: 'center' }}>
          <LocalHospitalIcon sx={{ display: { xs: 'none', lg: 'flex' }, mr: 1}} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', lg: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HOSPITAL RIPPER
          </Typography>
            
          <Box sx={{ width: 44, flexShrink: 0, display: { xs: 'flex', lg: 'none' }, justifyContent: 'center' }} >
            <IconButton
              size="large"
              aria-label="Abrir menú de navegación"
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
              sx={{ display: { xs: 'block', lg: 'none' } }}
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
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              display: { xs: 'flex', lg: 'none' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              flexGrow: 1,
              minWidth: 0,
              fontSize: { xs: '0.875rem', sm: '1.125rem' },
              fontFamily: 'inherit',
              fontWeight: 700,
              letterSpacing: '.02em',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 20 }} />
            HOSPITAL RIPPER
          </Typography>
          <Box component="nav" aria-label="Navegación principal" sx={{ flexGrow: 1, display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
            {pages.map((page) =>
              esSubmenu(page) ? (
                <NavSubmenu key={page.text} pagina={page} onNavigate={handleNavigateTo} />
              ) : (
                <Button
                  key={page.text}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 48 }}
                >
                  {page.text}
                </Button>
              )
            )}
          </Box>
          <Box sx={{ width: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              id="menu-usuario"
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
