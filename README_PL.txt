BINGO TORLINGO — POPRAWKA ODBIORNIKA GOOGLE CAST

Ten pakiet zastępuje pliki odbiornika hostowane w repozytorium GitHub Pages "torlingo-cast".

CO ZMIENIONO
- receiver.js został przepisany do składni zgodnej ze starszymi środowiskami JavaScript (bez ??, object spread, arrow functions, template literals i Set).
- index.html używa oficjalnego skryptu Cast Web Receiver SDK z adresu gstatic oraz wersjonowanych odwołań do plików, aby ograniczyć problem z cache.
- dodano prosty handler błędów JavaScript widoczny na ekranie odbiornika.

JAK WDROŻYĆ
1. Otwórz lokalny folder repozytorium GitHub Desktop "torlingo-cast".
2. Zastąp w nim pliki: index.html, receiver.js, styles.css, logo.png plikami z tego pakietu.
3. W GitHub Desktop wykonaj Commit to main, np. "Cast receiver compatibility fix".
4. Kliknij Push origin.
5. Poczekaj 1-3 minuty na wdrożenie GitHub Pages.
6. Otwórz stronę https://krzysztofnw.github.io/torlingo-cast/ w przeglądarce i sprawdź, czy panel nadal się wyświetla.
7. Uruchom ponownie telewizor Sony.
8. Nie włączaj Smart View. W Bingo Torlingo 2.7.6 wybierz Tryb dużego ekranu -> Cast -> Sony.

Nie trzeba zmieniać App ID 66327F96 ani ponownie publikować aplikacji Cast, ponieważ URL odbiornika pozostaje ten sam.
