import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type {
  ArboreGenealogic as ArboreGenealogicTip,
  NodArbore,
  NodDescendent,
  NodStramos,
} from '../types/arbore';

export type OrientareArbore = 'orizontala' | 'verticala';

const BOX_W = 160;
const BOX_H_BAZA = 34;
const LINIE_MUTATIE_H = 15;
const MAX_LINII_MUTATII = 3;
const BOX_H_MAX = BOX_H_BAZA + MAX_LINII_MUTATII * LINIE_MUTATIE_H;

const GEN_GAP = 70;
const SLOT_GAP = 24;

const PAS_GENERATIE: Record<OrientareArbore, number> = {
  orizontala: BOX_W + GEN_GAP,
  verticala: BOX_H_MAX + GEN_GAP,
};
const PAS_SLOT: Record<OrientareArbore, number> = {
  orizontala: BOX_H_MAX + SLOT_GAP,
  verticala: BOX_W + SLOT_GAP,
};

const SEX_LABEL: Record<string, string> = {
  MASCUL: 'Mascul',
  FEMELA: 'Femela',
  NECUNOSCUT: 'Necunoscut',
};

const SCARA_MIN = 0.6;
const SCARA_MAX = 2.5;
const SCARA_PAS = 0.2;

interface NodCuCopii extends NodArbore {
  copii: NodCuCopii[];
}

interface NodPozitionat extends NodArbore {
  generatie: number;
  pozitieUnit: number;
}

interface Muchie {
  parinteId: string;
  copilId: string;
}

function clamp(valoare: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valoare));
}

function inaltimeCasuta(nrMutatii: number): number {
  return BOX_H_BAZA + Math.min(nrMutatii, MAX_LINII_MUTATII) * LINIE_MUTATIE_H;
}

function stramosSpreCopii(nod: NodStramos | null): NodCuCopii | null {
  if (!nod) return null;
  const copii: NodCuCopii[] = [];
  const tata = stramosSpreCopii(nod.tata);
  const mama = stramosSpreCopii(nod.mama);
  if (tata) copii.push(tata);
  if (mama) copii.push(mama);
  return { ...nod, copii };
}

function construiesteRadacina(
  arbore: ArboreGenealogicTip,
  mod: 'stramosi' | 'descendenti',
): NodCuCopii {
  if (mod === 'descendenti') {
    return { ...arbore.pasare, copii: arbore.descendenti as NodDescendent[] as NodCuCopii[] };
  }
  const copii: NodCuCopii[] = [];
  const tata = stramosSpreCopii(arbore.stramosi.tata);
  const mama = stramosSpreCopii(arbore.stramosi.mama);
  if (tata) copii.push(tata);
  if (mama) copii.push(mama);
  return { ...arbore.pasare, copii };
}

function aseazaArbore(
  nod: NodCuCopii,
  generatie: number,
  start: number,
  noduri: NodPozitionat[],
  muchii: Muchie[],
): number {
  if (nod.copii.length === 0) {
    noduri.push({ ...nod, generatie, pozitieUnit: start + 0.5 });
    return 1;
  }

  let cursor = start;
  const centre: number[] = [];
  for (const copil of nod.copii) {
    const latime = aseazaArbore(copil, generatie + 1, cursor, noduri, muchii);
    centre.push(cursor + latime / 2);
    cursor += latime;
    muchii.push({ parinteId: nod.id, copilId: copil.id });
  }
  const pozitieUnit = (centre[0] + centre[centre.length - 1]) / 2;
  noduri.push({ ...nod, generatie, pozitieUnit });
  return Math.max(cursor - start, 1);
}

function coordonate(
  generatie: number,
  pozitieUnit: number,
  orientare: OrientareArbore,
  offsetGeneratie: number,
  offsetPerpendicular: number,
) {
  if (orientare === 'orizontala') {
    return {
      x: offsetGeneratie + generatie * PAS_GENERATIE.orizontala,
      y: offsetPerpendicular + pozitieUnit * PAS_SLOT.orizontala,
    };
  }
  return {
    x: offsetPerpendicular + pozitieUnit * PAS_SLOT.verticala,
    y: generatie * PAS_GENERATIE.verticala,
  };
}

function NodBox({
  nrInel,
  rnc,
  mutatii,
  onClick,
}: {
  nrInel: string;
  rnc: string | null;
  mutatii: string[];
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const liniiAfisate = mutatii.slice(0, MAX_LINII_MUTATII);
  const restul = mutatii.length - liniiAfisate.length;

  return (
    <Box
      onClick={onClick}
      sx={{
        width: BOX_W,
        height: inaltimeCasuta(mutatii.length),
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'text.secondary',
        bgcolor: 'background.paper',
        boxShadow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 1.25,
        py: 0.5,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-1px)' },
      }}
    >
      <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.2 }}>
        {nrInel}
        {rnc ? ` - ${rnc}` : ''}
      </Typography>
      {liniiAfisate.map((m, i) => (
        <Typography
          key={i}
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ lineHeight: 1.15 }}
        >
          {m}
        </Typography>
      ))}
      {restul > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.15 }}>
          +{restul} alte mutatii
        </Typography>
      )}
    </Box>
  );
}

export function ArboreGrafic({
  arbore,
  mod,
  orientare,
  onNodeClick,
}: {
  arbore: ArboreGenealogicTip;
  mod: 'stramosi' | 'descendenti';
  orientare: OrientareArbore;
  onNodeClick: (id: string) => void;
}) {
  const { noduri, muchii, adancimeMaxima, latimeTotalaUnit, radacinaId } = useMemo(() => {
    const radacina = construiesteRadacina(arbore, mod);
    const noduriLocale: NodPozitionat[] = [];
    const muchiiLocale: Muchie[] = [];
    const latime = aseazaArbore(radacina, 0, 0, noduriLocale, muchiiLocale);
    const adancime = noduriLocale.reduce((max, n) => Math.max(max, n.generatie), 0);
    return {
      noduri: noduriLocale,
      muchii: muchiiLocale,
      adancimeMaxima: adancime,
      latimeTotalaUnit: latime,
      radacinaId: radacina.id,
    };
  }, [arbore, mod]);

  const mapaNoduri = useMemo(() => new Map(noduri.map((n) => [n.id, n])), [noduri]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetGeneratie, setOffsetGeneratie] = useState(0);
  const [offsetPerpendicular, setOffsetPerpendicular] = useState(0);
  const [scara, setScara] = useState(1);

  const [anchorNod, setAnchorNod] = useState<HTMLElement | null>(null);
  const [nodSelectat, setNodSelectat] = useState<NodPozitionat | null>(null);

  // Zoomul reporneste de la 1 cand se schimba vizualizarea (tab sau orientare).
  useEffect(() => {
    setScara(1);
  }, [mod, orientare]);

  function onModificaScara(delta: number) {
    setScara((s) => clamp(Math.round((s + delta) * 100) / 100, SCARA_MIN, SCARA_MAX));
  }

  const extindePerpendicular = latimeTotalaUnit * PAS_SLOT[orientare];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function actualizeazaOffsete() {
      const cw = container!.clientWidth / scara;
      const ch = container!.clientHeight / scara;
      if (orientare === 'orizontala') {
        // orizontal: subiectul (generatia 0) porneste din centrul ecranului;
        // pe verticala (perpendicular), grupul de noduri e centrat daca incape.
        setOffsetGeneratie(Math.max(0, cw / 2 - BOX_W / 2));
        setOffsetPerpendicular(Math.max(0, (ch - extindePerpendicular) / 2));
      } else {
        // vertical: subiectul porneste din partea de sus (fara offset pe generatie);
        // pe orizontala (perpendicular), grupul de noduri e centrat daca incape.
        setOffsetGeneratie(0);
        setOffsetPerpendicular(Math.max(0, (cw - extindePerpendicular) / 2));
      }
    }
    actualizeazaOffsete();
    const observer = new ResizeObserver(actualizeazaOffsete);
    observer.observe(container);
    return () => observer.disconnect();
  }, [orientare, extindePerpendicular, scara]);

  const latimeTotala =
    orientare === 'orizontala'
      ? offsetGeneratie + (adancimeMaxima + 1) * PAS_GENERATIE.orizontala
      : offsetPerpendicular + extindePerpendicular;
  const inaltimeTotala =
    orientare === 'orizontala'
      ? offsetPerpendicular + extindePerpendicular
      : (adancimeMaxima + 1) * PAS_GENERATIE.verticala;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const subiect = mapaNoduri.get(radacinaId);
    if (!subiect) return;
    const { x, y } = coordonate(
      subiect.generatie,
      subiect.pozitieUnit,
      orientare,
      offsetGeneratie,
      offsetPerpendicular,
    );
    if (orientare === 'orizontala') {
      container.scrollTop = Math.max(0, y * scara - container.clientHeight / 2);
      container.scrollLeft = 0;
    } else {
      container.scrollLeft = Math.max(0, x * scara - container.clientWidth / 2);
      container.scrollTop = 0;
    }
  }, [mapaNoduri, radacinaId, orientare, offsetGeneratie, offsetPerpendicular, scara]);

  // Pinch-to-zoom pe mobil si Ctrl+scroll pe desktop - ascultatori nativi,
  // ca preventDefault() sa functioneze sigur (evenimentele React sunt pasive implicit).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let distantaInitiala = 0;
    let scaraInitiala = 1;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        distantaInitiala = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        setScara((s) => {
          scaraInitiala = s;
          return s;
        });
      }
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && distantaInitiala > 0) {
        e.preventDefault();
        const distantaNoua = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        setScara(clamp(scaraInitiala * (distantaNoua / distantaInitiala), SCARA_MIN, SCARA_MAX));
      }
    }
    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) distantaInitiala = 0;
    }
    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setScara((s) => clamp(Math.round((s - e.deltaY * 0.01) * 100) / 100, SCARA_MIN, SCARA_MAX));
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  const linii = useMemo(() => {
    return muchii.map((m) => {
      const parinte = mapaNoduri.get(m.parinteId)!;
      const copil = mapaNoduri.get(m.copilId)!;
      const pParinte = coordonate(parinte.generatie, parinte.pozitieUnit, orientare, offsetGeneratie, offsetPerpendicular);
      const pCopil = coordonate(copil.generatie, copil.pozitieUnit, orientare, offsetGeneratie, offsetPerpendicular);
      const hParinte = inaltimeCasuta(parinte.mutatii.length);

      if (orientare === 'orizontala') {
        return {
          x1: pParinte.x + BOX_W,
          y1: pParinte.y,
          x2: pCopil.x,
          y2: pCopil.y,
          key: `${m.parinteId}-${m.copilId}`,
        };
      }
      return {
        x1: pParinte.x,
        y1: pParinte.y + hParinte,
        x2: pCopil.x,
        y2: pCopil.y,
        key: `${m.parinteId}-${m.copilId}`,
      };
    });
  }, [muchii, mapaNoduri, orientare, offsetGeneratie, offsetPerpendicular]);

  function onNodClick(e: React.MouseEvent<HTMLElement>, nod: NodPozitionat) {
    setAnchorNod(e.currentTarget);
    setNodSelectat(nod);
  }

  function onInchidePreview() {
    setAnchorNod(null);
    setNodSelectat(null);
  }

  function onVeziFisa() {
    if (!nodSelectat) return;
    onNodeClick(nodSelectat.id);
    onInchidePreview();
  }

  return (
    <Box>
      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          {Math.round(scara * 100)}%
        </Typography>
        <Tooltip title="Micsoreaza">
          <span>
            <IconButton size="small" onClick={() => onModificaScara(-SCARA_PAS)} disabled={scara <= SCARA_MIN}>
              <RemoveIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Reseteaza zoom-ul">
          <IconButton size="small" onClick={() => setScara(1)}>
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Mareste">
          <span>
            <IconButton size="small" onClick={() => onModificaScara(SCARA_PAS)} disabled={scara >= SCARA_MAX}>
              <AddIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box
        ref={containerRef}
        sx={{ overflow: 'auto', maxHeight: { xs: '65vh', sm: '62vh' }, borderRadius: 1 }}
      >
        <Box
          sx={{
            width: (latimeTotala + BOX_W) * scara,
            height: (inaltimeTotala + BOX_H_MAX) * scara,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: latimeTotala + BOX_W,
              height: inaltimeTotala + BOX_H_MAX,
              transform: `scale(${scara})`,
              transformOrigin: 'top left',
              p: 2,
            }}
          >
            <svg
              width={latimeTotala + BOX_W}
              height={inaltimeTotala + BOX_H_MAX}
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            >
              {linii.map((l) => (
                <line
                  key={l.key}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke="currentColor"
                  strokeOpacity={0.35}
                  strokeWidth={1.75}
                />
              ))}
            </svg>
            {noduri.map((n) => {
              const { x, y } = coordonate(n.generatie, n.pozitieUnit, orientare, offsetGeneratie, offsetPerpendicular);
              const h = inaltimeCasuta(n.mutatii.length);
              const top = orientare === 'orizontala' ? y - h / 2 : y;
              const left = orientare === 'orizontala' ? x : x - BOX_W / 2;
              return (
                <Box key={n.id} sx={{ position: 'absolute', left, top }}>
                  <NodBox
                    nrInel={n.nrInel}
                    rnc={n.rnc}
                    mutatii={n.mutatii}
                    onClick={(e) => onNodClick(e, n)}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Popover
        open={!!anchorNod}
        anchorEl={anchorNod}
        onClose={onInchidePreview}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        {nodSelectat && (
          <Box sx={{ p: 2, minWidth: 220, maxWidth: 280 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {nodSelectat.nrInel}
              {nodSelectat.rnc ? ` - ${nodSelectat.rnc}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {SEX_LABEL[nodSelectat.sex] ?? nodSelectat.sex}
              {nodSelectat.dataEclozare
                ? ` - eclozata ${new Date(nodSelectat.dataEclozare).toLocaleDateString('ro-RO')}`
                : ''}
            </Typography>
            {nodSelectat.mutatii.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Mutatii: {nodSelectat.mutatii.join(', ')}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              <Button size="small" onClick={onInchidePreview}>
                Inchide
              </Button>
              <Button size="small" variant="contained" onClick={onVeziFisa}>
                Vezi fisa completa
              </Button>
            </Stack>
          </Box>
        )}
      </Popover>
    </Box>
  );
}
