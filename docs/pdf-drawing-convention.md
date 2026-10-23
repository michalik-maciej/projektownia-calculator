# Konwencja rysunku PDF do importu ciągów

Stan na 2026-10-23, zgodny z implementacją z brancha `spike/pdf-import`.

Kalkulator odczytuje ciągi z PDF projektu automatycznie, z tekstu i linii zapisanych w pliku. Działa
to tylko wtedy, gdy rysunek spełnia poniższe warunki; ciąg, który ich nie spełnia, jest pomijany bez
ostrzeżenia.

## Plik i eksport

Obecny eksport przez PDFCreator spełnia te warunki; chodzi o to, żeby tak zostało.

- **Jedna strona.** Rzut z ciągami musi być na stronie 1, kolejne strony nie są czytane.
- **Napisy jako tekst.** Bez zamiany tekstu na krzywe, bez spłaszczania, bez skanu ani zdjęcia
  wydruku.
- **Linie jako wektory**, czyli PDF wyeksportowany z programu, a nie obraz.
- **Skala dowolna.** Odległości są liczone względem wysokości liter opisu regału, więc rysunki w
  różnych skalach czytają się tak samo.
- **Inna wielkość tekstu dla innych napisów.** Wymiary, nazwy działów i numery ciągów muszą mieć
  inną wysokość liter niż opisy regałów. Napis tej samej wielkości tuż obok opisu jest traktowany
  jako dopisek do niego.

## Ciąg

Każdy ciąg to niebieska linia z numerem; opisy regałów leżą wzdłuż niej. Odległości podane w
milimetrach dotyczą wydruku w skali PDF (1 pt = 0,35 mm).

- **Linia niebieska**, dowolny odcień (składowa czerwona najwyżej 64, niebieska co najmniej 192 w
  skali od 0 do 255). Dotychczasowe rysunki używają #007fff, #003fff i #00bfff i wszystkie są czytane.
- **Linia prosta pod dowolnym kątem** (także ukośna, np. wzdłuż skośnej ściany), długa co najmniej ok. 3,5 mm, z grotami na obu końcach. Dwa ciągi
  na jednej osi muszą być rozdzielone: linia jednego kończy się, zanim zacznie się następna.
- **Niebieski tylko dla ciągów** (zalecenie). Inne niebieskie elementy nie psują odczytu, ale
  utrudniają jego kontrolę.
- **Numer w nawiasie**, np. `(5)`: same cyfry w nawiasie, bez innych znaków. Numer leży na linii,
  najwyżej ok. 2 mm od niej, między jej końcami.
- **Ten sam numer oznacza identyczny ciąg.** Jednakowe ciągi o tym samym numerze trafiają do
  oferty jako jedna pozycja z liczbą ciągów, np. dwie gondole `(6)` jako jedna pozycja ×2.
- **Opisy regałów równolegle do linii**, czyli tekst biegnie w tym samym kierunku co linia (z
  dokładnością do 2°).
- **Wszystkie opisy po jednej stronie linii**, w odległości najwyżej 13 wysokości liter opisu (przy
  literach 4,5 pt to ok. 20 mm). Opis po drugiej stronie linii należy do innego ciągu albo jest
  pomijany.
- **Ciąg przyścienny ma jeden rząd opisów**, a wszystkie jego regały mają tę samą głębokość i
  wysokość. Ciąg o mieszanych wymiarach jest pomijany.

## Opis regału

Każdy regał ma opis w dwóch liniach i nic więcej; każdy inny napis w opisie odbiera regałowi półki.

1. `100/37/210`: szerokość / głębokość / wysokość w cm, same liczby rozdzielone ukośnikiem.
2. `6x37`: liczba półek wiszących x głębokość półki w cm, mała litera `x`, bez spacji. Jedyny
   dozwolony dopisek to `+ PERF` (np. `7x30 + PERF`), który nie zmienia odczytu półek.

- **Obie linie razem**: ten sam kierunek tekstu, ta sama wielkość liter, druga linia najwyżej 3
  wysokości liter od pierwszej.
- **Dopiski poza opisem.** Napis tej samej wielkości tuż przy opisie (np. `2xKP / 2xPP`,
  `drzwi szklane`) albo inny dopisek w linii półek niż `+ PERF` sprawia, że regał jest wczytany
  bez półek, do uzupełnienia ręcznie. Takie informacje najlepiej pisać mniejszą lub większą czcionką
  albo dalej od opisu.
- **Brak linii półek** oznacza regał bez półek.
- **Zawsze przyjmowane są osłona dolna i pojedyncze plecy.** Inny wariant ustawia się ręcznie po
  imporcie.

## Gondola i szczyty

Gondola to jeden ciąg z dwoma rzędami opisów; jej szczyty są jego częścią i nie mają własnej linii
ani numeru.

- **Jedna niebieska linia wzdłuż jednego boku gondoli i jeden numer** `(n)`, według zasad z sekcji
  Ciąg.
- **Opisy obu stron po tej samej stronie linii, w dwóch równoległych rzędach**, tak jak regały stoją
  plecami do siebie. Rzędy muszą być od siebie oddalone o więcej niż wysokość liter opisu. Rząd
  dalszy od linii to strona 1, bliższy to strona 2.
- **Każda strona ma regały jednej głębokości.**
- **Linia gondoli obejmuje też szczyty**: biegnie od zewnętrznej krawędzi jednego szczytu do
  zewnętrznej krawędzi drugiego.
- **Opis szczytu leży prostopadle do linii gondoli, przy jej końcu**: najwyżej 6 wysokości liter od
  końca linii, w poprzek między linią a dalszym rzędem opisów.
- **Lewy szczyt to ten po lewej stronie numeru gondoli czytanego prosto**, drugi to prawy.
- **Wszystkie regały obu stron i oba szczyty mają tę samą wysokość.** Gondola o mieszanych
  wysokościach jest pomijana razem ze szczytami.
- **Gondola bez szczytów albo z jednym szczytem jest poprawna.**
- **Dawne oznaczenie szczytu nie jest czytane.** Szczyt narysowany jako osobny krótki ciąg z
  własnym numerem (np. `(8)`) zostanie wczytany jako osobny ciąg przyścienny, a gondola bez
  szczytu.

## Czego odczyt dziś nie obsługuje

Te przypadki wystąpiły w dotychczasowych rysunkach; żaden nie daje błędu, tylko pomija ciąg albo
jego część.

| Przypadek na rysunku                                        | Skutek                                            | Jak rysować                                         |
| ----------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------- |
| Numer bez nawiasu, np. `5`                                  | ciąg pominięty                                    | `(5)`                                               |
| Szczyt jako osobny ciąg z własnym numerem                   | szczyt jako ciąg przyścienny, gondola bez szczytu | szczyt w obrębie linii gondoli, bez numeru          |
| Dopisek przy opisie albo w linii półek (`2xPP`)             | regał bez półek                                   | dopisek inną wielkością tekstu albo dalej od opisu  |
| Więcej niż dwa rzędy opisów przy jednej linii               | ciąg pominięty                                    | jeden rząd dla ciągu przyściennego, dwa dla gondoli |
| Ciąg przyścienny z regałami różnej głębokości lub wysokości | ciąg pominięty                                    | osobne ciągi z osobnymi numerami                    |
| Gondola z regałami lub szczytami różnej wysokości           | gondola pominięta                                 | osobne gondole z osobnymi numerami                  |
| Tekst zamieniony na krzywe, skan, zdjęcie                   | nic nie jest czytane                              | eksport z programu z tekstem                        |
| Rzut na drugiej lub dalszej stronie                         | nic nie jest czytane                              | rzut na stronie 1                                   |
