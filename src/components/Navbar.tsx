import { NavLink } from 'react-router-dom';
import ConnectionStatus from './ConnectionStatus';

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink className="navbar-brand" to="/" end aria-label="UniPlanner, inicio">
        <span className="brand-mark">U</span><span>uniplanner<span className="brand-dot">.</span></span>
      </NavLink>
      <nav>
        <NavLink to="/" end>Resumen</NavLink>
        <NavLink to="/tareas">Tareas</NavLink>
        <NavLink to="/eventos">Eventos</NavLink>
        <NavLink to="/configuracion">Configuración</NavLink>
      </nav>
      <ConnectionStatus />
    </header>
  );
}