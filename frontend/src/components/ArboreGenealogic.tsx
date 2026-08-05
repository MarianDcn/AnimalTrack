import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ArboreGenealogic as ArboreGenealogicTip, NodDescendent, NodStramos } from '../types/arbore';

const COL_WIDTH = 190;
const BOX_W = 156;
const BOX_H = 46;
const LEAF_ROW_H = 58;

const SEX_CULOARE: Record<string, string> = {
  MASCUL: '#1565c0',
  FEMELA: '#ad1457',
  NECUNOSCUT: '#616161',
};

interface NodPozitionat {
  id: string;
  nrInel: string;
  nume: string | null;
  sex: string;
  mutatie: string | null;
  generatie: number;
  slot: number;
  areTata: boolean;
  areMama: boolean;
}

function aplatizeaza(
  nod: NodStramos | null,
  generatie: number,
  slot: number,
  acumulator: NodPozitionat[],
) {
  if (!nod) return;
  acumulator.push({
    id: nod.id,
    nrInel: nod.nrInel,
    nume: nod.nume,
    sex: nod.sex,
    mutatie: nod.mutatie,
    generatie,
    slot,
    areTata: !!nod.tata,
    areMama: !!nod.mama,
  });
  aplatizeaza(nod.tata, generatie + 1, slot * 2, acumulator);
  aplatizeaza(nod.mama, generatie + 1, slot * 2 + 1, acumulator);
}

function pozitie(generatie: number, slot: number, generatiiTotale: number) {
  const totalInaltime = LEAF_ROW_H * 2 ** generatiiTotale;
  const inaltimeSlot = totalInaltime / 2 ** generatie;
  const x = generatie * COL_WIDTH;
  const y = (slot + 0.5) * inaltimeSlot;
  return { x, y, totalInaltime };
}

function NodBox({
  nrInel,
  nume,
  sex,
  mutatie,
  onClick,
}: {
  nrInel: string;
  nume: string | null;
  sex: string;
  mutatie: string | null;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: BOX_W,
        height: BOX_H,
        borderRadius: 1,
        border: '2px solid',
        borderColor: SEX_CULOARE[sex] ?? SEX_CULOARE.NECUNOSCUT,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 1,
        cursor: 'pointer',
        overflow: 'hidden',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.2 }}>
        {nrInel}
        {nume ? ` - ${nume}` : ''}
      </Typography>
      {mutatie && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.1 }}>
          {mutatie}
        </Typography>
      )}
    </Box>
  );
}

export function ArboreStramosi({
  arbore,
  generatiiSus,
  onNodeClick,
}: {
  arbore: ArboreGenealogicTip;
  generatiiSus: number;
  onNodeClick: (id: string) => void;
}) {
  const radacina: NodStramos = {
    ...arbore.pasare,
    tata: arbore.stramosi.tata,
    mama: arbore.stramosi.mama,
  };

  const noduri: NodPozitionat[] = [];
  aplatizeaza(radacina, 0, 0, noduri);

  const { totalInaltime } = pozitie(0, 0, generatiiSus);
  const latimeTotala = (generatiiSus + 1) * COL_WIDTH;

  const linii: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const n of noduri) {
    const { x, y } = pozitie(n.generatie, n.slot, generatiiSus);
    if (n.areTata) {
      const copil = pozitie(n.generatie + 1, n.slot * 2, generatiiSus);
      linii.push({ x1: x + BOX_W, y1: y, x2: copil.x, y2: copil.y });
    }
    if (n.areMama) {
      const copil = pozitie(n.generatie + 1, n.slot * 2 + 1, generatiiSus);
      linii.push({ x1: x + BOX_W, y1: y, x2: copil.x, y2: copil.y });
    }
  }

  return (
    <Box sx={{ overflow: 'auto', maxHeight: '60vh' }}>
      <Box sx={{ position: 'relative', width: latimeTotala, height: totalInaltime }}>
        <svg
          width={latimeTotala}
          height={totalInaltime}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {linii.map((l, i) => (
            <line
              key={i}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {noduri.map((n) => {
          const { x, y } = pozitie(n.generatie, n.slot, generatiiSus);
          return (
            <Box key={n.id} sx={{ position: 'absolute', left: x, top: y - BOX_H / 2 }}>
              <NodBox
                nrInel={n.nrInel}
                nume={n.nume}
                sex={n.sex}
                mutatie={n.mutatie}
                onClick={() => onNodeClick(n.id)}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export function ArboreDescendenti({
  descendenti,
  onNodeClick,
}: {
  descendenti: NodDescendent[];
  onNodeClick: (id: string) => void;
}) {
  if (descendenti.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Niciun descendent inregistrat.
      </Typography>
    );
  }

  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {descendenti.map((n) => (
        <RamuraDescendent key={n.id} nod={n} onNodeClick={onNodeClick} />
      ))}
    </Box>
  );
}

function RamuraDescendent({
  nod,
  onNodeClick,
}: {
  nod: NodDescendent;
  onNodeClick: (id: string) => void;
}) {
  return (
    <Box component="li" sx={{ my: 0.5 }}>
      <Box sx={{ display: 'inline-block' }}>
        <NodBox
          nrInel={nod.nrInel}
          nume={nod.nume}
          sex={nod.sex}
          mutatie={nod.mutatie}
          onClick={() => onNodeClick(nod.id)}
        />
      </Box>
      {nod.copii.length > 0 && (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            pl: 3,
            borderLeft: '2px solid',
            borderColor: 'divider',
            ml: 2,
          }}
        >
          {nod.copii.map((c) => (
            <RamuraDescendent key={c.id} nod={c} onNodeClick={onNodeClick} />
          ))}
        </Box>
      )}
    </Box>
  );
}
