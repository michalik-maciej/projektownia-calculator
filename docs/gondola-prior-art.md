# Prior art: gondole we wcześniejszych kalkulatorach

## TL;DR

Gondola to **dwie strony** (`sides`), nie segmenty wzdłuż ciągu. Obie wcześniejsze implementacje
zgadzają się co do tego niezależnie. Wersja pierwsza, jedyna która realnie wyceniała gondole na
produkcji, **dzieliła nogi na pół między strony** (`0.5 *` na stronę). Dzisiejszy
`calculateGondolaLayoutDemand` wychodzi na to samo inną drogą: liczy jedną wspólną kolumnę nóg na
gondolę, ze strony o większej liczbie regałów. „Rozłącz gondolę" też już istniało, jako kłódka trzymająca obie
strony w symetrii.

## Key Decisions

- Materiał z `projektownia-kalkulator` (v1) i `next-kalkulator` (v2) zapisany w katalogu zadania,
  bo rozstrzyga pytania, których dzisiejszy kod nie rozstrzyga.
- v1 jest autorytetem w kwestii ilości i wyceny, v2 w kwestii geometrii rysunku i szczytów.
- `remix-kalkulator` (v3) gondole usunął całkowicie i nie wnosi nic poza stylem walidacji.

## Open Questions / Risks

- Dzielenie nóg między strony: rozstrzygnięte przez maintainera. Nogi liczą się raz na gondolę,
  ze strony o większej liczbie regałów, więc dla symetrycznej gondoli wychodzi tyle co w v1. Stopy
  zostają per strona. Strony mogą mieć różną siatkę szerokości (np. regał skrócony przy słupie);
  brakującą wtedy nogę użytkownik dopisuje sam w „Inne elementy”, domena jej nie wylicza.
- `numberOfGondolaUnits` ani `gondolaUnits` już nie istnieją. Strony to krotka dwóch elementów
  `sides` w `LayoutGondola.schema.ts`, każda z własną głębokością, regałami, plecami i osłoną.
  Oferty zapisane w starym kształcie (`gondolaUnits` z jednym symetrycznym wpisem) schemat czyta
  jako dwie równe strony.
- Reguła „półka nie głębsza niż baza" nie istniała nigdy. To nowe wymaganie klienta, nie regresja.
- Szczyt jest osobnym polem (`leftEndCap`, `rightEndCap`), nie wpisem w `sides`, więc
  dwuznaczność stron kontra segmentów się nie pogłębiła.

---

## Gdzie czego szukać

| Repo                           | Gondole                                                              |
| ------------------------------ | -------------------------------------------------------------------- |
| `projektownia-kalkulator` (v1) | pełna implementacja i wycena, Formik + Chakra + Firestore            |
| `next-kalkulator` (v2)         | drugi model, ze szczytami, Zod + RHF + shadcn + Prisma, nieukończony |
| `remix-kalkulator` (v3)        | usunięte, model płaski bez stron                                     |
| `masterplan*`, `bubu-vanilla`  | brak, jedyne trafienie to nazwa koloru w CSS                         |

## v1: model, który wyceniał u klienta

```ts
export type FormSubCollectionType = {
  depth: string
  hasBaseCover: boolean
  stands: FormStandType[]
}

export type FormCollectionType = {
  height: string
  isCollapsed?: boolean
  // flag to edit both sub collections at once or separately
  isEditLocked?: boolean
  variant: CollectionOption // "P" | "G" | "I"
  numberOfCollections: number
  otherItems: FormOtherType[]
  subCollections: FormSubCollectionType[]
}
```

`subCollections` to zawsze `Array(2)`, również dla ciągu przyściennego, gdzie druga strona jest po
prostu nieczytana (`variant === "P" ? [subCollections[0]] : subCollections`). Konwersja przyścienny
na dwustronny była więc bezstratna, w przeciwieństwie do dzisiejszych dwóch rozłącznych schematów.

Podział odpowiedzialności, identyczny z dzisiejszym:

| Poziom                   | Pola                                                  | Znaczenie                  |
| ------------------------ | ----------------------------------------------------- | -------------------------- |
| ciąg                     | `height`, `variant`, `numberOfCollections`            | wspólne dla obu stron      |
| strona (`subCollection`) | `depth`, `hasBaseCover`                               | głębokość jest per strona  |
| segment (`stand`)        | `width`, `numberOfStands`, `backVariant`, `shelves[]` | szerokość jest per segment |

## v1: dzielenie nóg między strony

`src/utils/order/orderLegs.ts`:

```ts
const number = sumBy("numberOfStands", stands) + 1
return [
  {
    // share profiles in gondola and impulse collections between sides
    number: variant === "P" ? number : 0.5 * number,
    price: number * profile.price,
  },
]
```

Połówki sumowane po stronach, potem `Math.ceil` w agregacie. Stopy (`orderFeet.ts`) **nie** były
dzielone: każda strona dostaje własne `sumBy("numberOfStands", stands) + 1`. Asymetria celowa i
fizyczna: jedna wspólna kolumna nóg, dwa niezależne komplety stóp.

Dzisiejszy `calculateGondolaLayoutDemand` woła `calculateRunSideDemand` per strona (wszystko poza
nogami), a nogi liczy raz, ze strony o większej liczbie regałów. Własny test repo utrwala
`{ id: "leg-130-8-3", quantity: 4 }` dla trzech regałów po obu stronach, czyli tyle, ile dawała
reguła v1.

Uwaga: v1 miało tu własny błąd, `price` liczone z niepodzielonego `number`, więc cena nóg gondoli
była podwójna wobec ilości. Tego nie przenosić.

## v1: „rozłącz gondolę" jako kłódka

`src/components/SubForms/FormSubCollection.tsx`:

```tsx
useEffect(() => {
  if (isEditLocked) {
    setValues({
      ...values,
      collections: values.collections.map((collection, index) =>
        index === collectionIndex
          ? { ...collection, subCollections: Array(2).fill(subCollection) }
          : collection,
      ),
    })
  }
}, [subCollection])
```

Semantyka warta powtórzenia:

- Domyślnie **zamknięta** (commit `7855b3f` „initial locked mode" przestawił to z `false`). To jest
  zakodowane „90% gondol jest symetrycznych".
- Przy zamkniętej kłódce każda kontrolka strony drugiej jest `isDisabled`, ale nadal widoczna, więc
  użytkownik cały czas widzi obie strony.
- Otwarcie kłódki niczego nie przebudowuje, tylko przestaje kopiować. **Rozłączenie to flaga, nie
  migracja danych**, i jest odwracalne.

## v1: szczyt, plecy, osłony

- **Szczyt**: nie istniał.
- **Podwójne plecy**: `backVariant` o wartościach `"0" | "1" | "2"`, użyte jako mnożnik w
  `orderBacks.ts`. Dla gondoli opcja `"2"` była **ukrywana**, bo dwie strony i tak dają dwa
  komplety pleców, więc „podwójne" liczyłoby potrójnie.
- **Osłona dolna**: `hasBaseCover`, boolean **per strona**, kategoria produktowa „Osłony dolne".
- **Osłona górna**: tylko jako pozycja z katalogu „inne", dokładnie w roli dzisiejszych `extras`.

## v2: geometria i szczyty

```ts
export const groupSchema = z.object({
  foot: z.number(),
  stands: z.array(standSchema),
  variant: z.enum(["peak", "side", "side-gondola"]),
})
```

Gondola to **cztery grupy: strona, strona, szczyt, szczyt**:

```ts
if (variant === "G") {
  return [...Array(2).fill(groupSideGondola), ...Array(2).fill(groupPeak)]
}
```

Rysunek to widok z góry, siatka CSS ustawia strony jako dwa poziome pasy w środkowej kolumnie, a
szczyty obrócone o 90 stopni na końcach, domykając prostokąt. Skala `1.6 * foot` na wysokość i
`1.6 * width` na szerokość, czyli ta sama stała, którą dziś ma `WallLayoutPlan`.

Dwie reguły stamtąd warte zachowania: szczytu nie da się poszerzyć (przycisk dodania regału jest
`disabled` dla `variant === 'peak'`), a usunięcie szczytu robiło się przez skasowanie jego jedynego
regału, po czym pusta grupa renderowała placeholder z plusem jako sposób na powrót.

Zastrzeżenie: `'side-gondola'` w v2 jest deklarowane, ale **nigdzie nieczytane**. v2 nigdy nie
zaimplementowało dzielenia nóg i liczy je podwójnie względem v1. **v2 nie jest autorytetem w
kwestii ilości.**

## v2: opis ciągu

```ts
const collectionVariants = {
  P: "przyściennych",
  G: "dwustronnych",
  I: "impulsów",
}
```

Identyczne słownictwo jak dziś w `buildLayoutDescription`. Obie wersje czytały **tylko stronę
zerową**, więc opis zakładał symetrię i przy rozłączonych stronach był błędny. Dziś opis gondoli
nie rozróżnia stron: sumuje regały obu stron według szerokości (`2x80` i `3x80` dają `5x80`),
różne bazy i półki wymienia po ukośniku (`baza 47/37`), a szczyty podaje wymiarami, dwa jednakowe
jako `2x szczyt 100/37`.

## Walidacja głębokości półek

Nie istniała w żadnej wersji. W v1 zmiana głębokości bazy **nadpisywała głębokość wszystkich półek**
na tej stronie, po czym użytkownik mógł je ręcznie zmienić w dowolną stronę, także głębiej niż baza.
Opcje półek filtrowane były wyłącznie po szerokości. Wymaganie klienta jest więc nowe i trzeba
zdecydować, czy zmniejszenie bazy przycina półki (styl v1, destrukcyjnie), czy blokuje.
