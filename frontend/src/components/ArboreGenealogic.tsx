import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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

  const extindePerpendicular = latimeTotalaUnit * PAS_SLOT[orientare];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function actualizeazaOffsete() {
      const cw = container!.clientWidth;
      const ch = container!.clientHeight;
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
  }, [orientare, extindePerpendicular]);

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
      container.scrollTop = Math.max(0, y - container.clientHeight / 2);
      container.scrollLeft = 0;
    } else {
      container.scrollLeft = Math.max(0, x - container.clientWidth / 2);
      container.scrollTop = 0;
    }
  }, [mapaNoduri, radacinaId, orientare, offsetGeneratie, offsetPerpendicular]);

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

  return (
    <Box
      ref={containerRef}
      sx={{ overflow: 'auto', maxHeight: { xs: '70vh', sm: '65vh' }, borderRadius: 1 }}
    >
      <Box
        sx={{
          position: 'relative',
          width: latimeTotala + BOX_W,
          height: inaltimeTotala + BOX_H_MAX,
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
                onClick={() => onNodeClick(n.id)}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
