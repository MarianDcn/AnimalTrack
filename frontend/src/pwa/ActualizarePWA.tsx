import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function ActualizarePWA() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  function onActualizeaza() {
    updateServiceWorker(true);
  }

  function onInchide() {
    setNeedRefresh(false);
  }

  return (
    <Snackbar open={needRefresh} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert
        severity="info"
        onClose={onInchide}
        action={
          <Button color="inherit" size="small" onClick={onActualizeaza}>
            Actualizeaza
          </Button>
        }
      >
        O versiune noua a aplicatiei e disponibila.
      </Alert>
    </Snackbar>
  );
}
