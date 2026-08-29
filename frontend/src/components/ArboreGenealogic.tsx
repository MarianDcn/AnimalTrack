import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ArboreGenealogic as ArboreGenealogicTip, NodDescendent, NodStramos } from '../types/arbore';

const COL_WIDTH = 190;
const BOX_W = 156;
const BOX_H_BAZA = 30;
const LINIE_MUTATIE_H = 14;
const MAX_LINII_MUTATII = 3;
const LEAF_ROW_H = 92;

const SEX_CULOARE: Record<string, string> = {
  MASCUL: '#1565c0',
  FEMELA: '#ad1457',
  NECUNOSCUT: '#616161',
};

function inaltimeCasuta(nrMutatii: number): number {
  return BOX_H_BAZA + Math.min(nrMutatii, MAX_LINII_MUTATII) * LINIE_MUTATIE_H;
}

interface NodPozitionat {
  id: string;
  nrInel: string;
  rnc: string | null;
  sex: string;
  mutatii: string[];
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
    rnc: nod.rnc,
    sex: nod.sex,
    mutatii: nod.mutatii,
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
  rnc,
  sex,
  mutatii,
  onClick,
}: {
  nrInel: string;
  rnc: string | null;
  sex: string;
  mutatii: string[];
  onClick: () => void;
}) {
  const liniiAfisate = mutatii.slice(0, MAX_LINII_MUTATII);
  const restul = mutatii.length - liniiAfisate.length;

  return (
    <Box
      onClick={onClick}
      sx={{
        width: BOX_W,
        height: inaltimeCasuta(mutatii.length),
        borderRadius: 1,
        border: '2px solid',
        borderColor: SEX_CULOARE[sex] ?? SEX_CULOARE.NECUNOSCUT,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 1,
        py: 0.5,
        cursor: 'pointer',
        overflow: 'hidden',
        '&:hover': { bgcolor: 'action.hover' },
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

export function ArboreStramosi({
  arbore,
  onNodeClick,
}: {
  arbore: ArboreGenealogicTip;
  onNodeClick: (id: string) => void;
}) {
  const radacina: NodStramos = {
    ...arbore.pasare,
    tata: arbore.stramosi.tata,
    mama: arbore.stramosi.mama,
  };

  const noduri: NodPozitionat[] = [];
  aplatizeaza(radacina, 0, 0, noduri);

  // Layout-ul foloseste adancimea reala gasita in date, nu limita maxima ceruta
  // (altfel un arbore cu doar 2 generatii cunoscute ar rezerva spatiu de scroll pentru 5).
  const adancimeMaxima = noduri.reduce((max, n) => Math.max(max, n.generatie), 0);

  const { y: subiectY, totalInaltime } = pozitie(0, 0, adancimeMaxima);
  const latimeTotala = (adancimeMaxima + 1) * COL_WIDTH;

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = Math.max(0, subiectY - container.clientHeight / 2);
  }, [subiectY, adancimeMaxima]);

  const linii: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (const n of noduri) {
    const { x, y } = pozitie(n.generatie, n.slot, adancimeMaxima);
    if (n.areTata) {
      const copil = pozitie(n.generatie + 1, n.slot * 2, adancimeMaxima);
      linii.push({ x1: x + BOX_W, y1: y, x2: copil.x, y2: copil.y });
    }
    if (n.areMama) {
      const copil = pozitie(n.generatie + 1, n.slot * 2 + 1, adancimeMaxima);
      linii.push({ x1: x + BOX_W, y1: y, x2: copil.x, y2: copil.y });
    }
  }

  return (
    <Box ref={containerRef} sx={{ overflow: 'auto', maxHeight: '60vh' }}>
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
          const { x, y } = pozitie(n.generatie, n.slot, adancimeMaxima);
          return (
            <Box
              key={n.id}
              sx={{ position: 'absolute', left: x, top: y - inaltimeCasuta(n.mutatii.length) / 2 }}
            >
              <NodBox
                nrInel={n.nrInel}
                rnc={n.rnc}
                sex={n.sex}
                mutatii={n.mutatii}
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
          rnc={nod.rnc}
          sex={nod.sex}
          mutatii={nod.mutatii}
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
