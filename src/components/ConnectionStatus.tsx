import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function ConnectionStatus() {
  const online = useOnlineStatus();
  return (
    <span className={`connection-status ${online ? '' : 'offline'}`}>
      {online ? '● En línea' : '● Sin conexión'}
    </span>
  );
}