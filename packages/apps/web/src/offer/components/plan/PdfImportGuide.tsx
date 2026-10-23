import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../../core/ui/dialog"
import { textSection } from "../../../core/ui/typography"

const GUIDE_SECTIONS = [
  {
    rules: [
      "Rzut z ciągami jest na stronie 1, kolejne strony nie są czytane.",
      "Napisy zostają tekstem: bez zamiany na krzywe, bez spłaszczania, bez skanu ani zdjęcia wydruku.",
      "Linie są wektorami, czyli PDF jest wyeksportowany z programu, a nie zapisany jako obraz.",
      "Skala jest dowolna: odległości liczą się względem wysokości liter opisu regału.",
      "Wymiary, nazwy działów i numery ciągów mają inną wielkość liter niż opisy regałów.",
    ],
    title: "Plik i eksport",
  },
  {
    rules: [
      "Niebieska linia prosta pod dowolnym kątem, z grotami na obu końcach, długa co najmniej ok. 3,5 mm.",
      "Dwa ciągi na jednej osi są rozdzielone: linia jednego kończy się, zanim zacznie się następna.",
      "Numer w nawiasie, np. (5), same cyfry. Leży na linii, najwyżej ok. 2 mm od niej, między jej końcami.",
      "Jednakowe ciągi o tym samym numerze trafiają do oferty jako jedna pozycja z liczbą ciągów.",
      "Opisy regałów biegną równolegle do linii, wszystkie po jednej jej stronie, najwyżej 13 wysokości liter od niej.",
      "Ciąg przyścienny ma jeden rząd opisów, a jego regały mają tę samą głębokość i wysokość.",
    ],
    title: "Ciąg",
  },
  {
    rules: [
      "Pierwsza linia: 100/37/210, czyli szerokość / głębokość / wysokość w cm.",
      "Druga linia: 6x37, czyli liczba półek wiszących x głębokość półki w cm. Dozwolony dopisek: + PERF.",
      "Obie linie mają ten sam kierunek i wielkość liter; druga leży najwyżej 3 wysokości liter od pierwszej.",
      "Dopisek tej samej wielkości przy opisie (np. 2xPP, drzwi szklane) odbiera regałowi półki. Takie informacje pisz inną czcionką albo dalej od opisu.",
      "Brak linii półek oznacza regał bez półek.",
      "Zawsze przyjmowane są osłona dolna i pojedyncze plecy; inny wariant ustawiasz po imporcie.",
    ],
    title: "Opis regału",
  },
  {
    rules: [
      "Jedna niebieska linia wzdłuż jednego boku gondoli i jeden numer.",
      "Opisy obu stron po tej samej stronie linii, w dwóch równoległych rzędach. Dalszy rząd to strona 1, bliższy to strona 2.",
      "Każda strona ma regały jednej głębokości, a wszystkie regały i szczyty mają tę samą wysokość.",
      "Linia gondoli obejmuje też szczyty; opis szczytu leży w poprzek linii, najwyżej 6 wysokości liter od jej końca.",
      "Lewy szczyt to ten po lewej stronie numeru gondoli czytanego prosto. Gondola bez szczytów albo z jednym jest poprawna.",
    ],
    title: "Gondola i szczyty",
  },
  {
    rules: [
      "Jedna niebieska linia i jeden numer dla całego ciągu impulsów, także gdy łączy impulsy niskie i wysokie.",
      "Opisy obu stron po tej samej stronie linii, w dwóch rzędach: bliżej linii strona klienta, za nią strona sprzedawcy, najwyżej 5 wysokości liter dalej.",
      "Strona klienta: h-90 66/30/2x30, czyli wysokość, szerokość / głębokość / liczba półek wiszących x głębokość półki. Wysokość może też stać w osobnej linii nad opisem (h-130).",
      "Wysokość wynika tylko z dopisku h-90 (niski) albo h-130 (wysoki). Słowa takie jak impuls niski czy lada są pomijane, mogą być w dowolnym języku.",
      "Strona sprzedawcy: 66/47/1x47 albo 66/47, gdy z tyłu nie ma półek, bez dopisku h-. Głębokość 47 lub 37, ta sama w całym ciągu.",
      "Każdy regał ma opis po obu stronach, o tej samej szerokości.",
      "Zawsze przyjmowane są plecy z obu stron i osłona dolna od frontu; inny wariant ustawiasz po imporcie.",
    ],
    title: "Impuls",
  },
]

const SKIPPED_CASES = [
  {
    effect: "ciąg pominięty",
    fix: "(5)",
    situation: "Numer bez nawiasu, np. 5",
  },
  {
    effect: "szczyt jako ciąg przyścienny, gondola bez szczytu",
    fix: "szczyt w obrębie linii gondoli, bez numeru",
    situation: "Szczyt jako osobny ciąg z własnym numerem",
  },
  {
    effect: "regał bez półek",
    fix: "dopisek inną wielkością tekstu albo dalej od opisu",
    situation: "Dopisek przy opisie albo w linii półek (2xPP)",
  },
  {
    effect: "ciąg pominięty",
    fix: "jeden rząd dla ciągu przyściennego, dwa dla gondoli",
    situation: "Więcej niż dwa rzędy opisów przy jednej linii",
  },
  {
    effect: "ciąg pominięty",
    fix: "osobne ciągi z osobnymi numerami",
    situation: "Ciąg przyścienny z regałami różnej głębokości lub wysokości",
  },
  {
    effect: "gondola pominięta",
    fix: "osobne gondole z osobnymi numerami",
    situation: "Gondola z regałami lub szczytami różnej wysokości",
  },
  {
    effect: "impuls pominięty",
    fix: "h-90 albo h-130 przy każdym opisie strony klienta",
    situation: "Opis strony klienta bez dopisku h- albo z inną wysokością",
  },
  {
    effect: "osobne impulsy, wspólna noga liczona dwa razy",
    fix: "jeden numer dla całego ciągu impulsów",
    situation: "Sąsiednie impulsy z osobnymi numerami",
  },
  {
    effect: "impuls pominięty",
    fix: "opis po obu stronach każdego regału, ta sama szerokość",
    situation: "Regał impulsu opisany tylko z jednej strony",
  },
  {
    effect: "impuls pominięty",
    fix: "jedna głębokość 47 lub 37 w całym ciągu",
    situation: "Strona sprzedawcy z inną albo różną głębokością",
  },
  {
    effect: "nic nie jest czytane",
    fix: "eksport z programu z tekstem",
    situation: "Tekst zamieniony na krzywe, skan, zdjęcie",
  },
  {
    effect: "nic nie jest czytane",
    fix: "rzut na stronie 1",
    situation: "Rzut na drugiej lub dalszej stronie",
  },
]

export function PdfImportGuide({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogTitle>Jak przygotować plik PDF do importu</DialogTitle>
        <DialogDescription>
          Ciąg, który nie spełnia tych warunków, jest pomijany bez ostrzeżenia.
          Wczytane ciągi są poza ofertą, włączasz je przełącznikiem „Wliczaj do
          oferty”.
        </DialogDescription>
        {GUIDE_SECTIONS.map(({ rules, title }) => (
          <section key={title}>
            <h3 className={textSection}>{title}</h3>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-4">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h3 className={textSection}>Czego odczyt nie obsługuje</h3>
          <table className="mt-2 w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-normal">Na rysunku</th>
                <th className="py-1 pr-3 font-normal">Skutek</th>
                <th className="py-1 font-normal">Jak rysować</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SKIPPED_CASES.map(({ effect, fix, situation }) => (
                <tr key={situation}>
                  <td className="py-1.5 pr-3">{situation}</td>
                  <td className="py-1.5 pr-3">{effect}</td>
                  <td className="py-1.5">{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </DialogContent>
    </Dialog>
  )
}
