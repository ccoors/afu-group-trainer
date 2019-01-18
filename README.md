# AFU group trainer
Diese Software soll das gemeinsame Lernen für die AFU-Prüfung ermöglichen. Die Idee ist, dass bei einem Lernabend jeder die Frage beantwortet, anstatt dass sich nur einer meldet. Dadurch sollen Schwächen schneller erkannt und der Lerneffekt verbessert werden.

## Autor und Kontakt
Christian Friedrich Coors, Rufzeichen DL5LQ, me@dl5lq.de

Fragen, Anmerkungen, Kommentare, Erfahrungen und Pull Requests sind gerne gesehen. Accountanfragen für die "offizielle" Instanz auf https://agt.dl5lq.de/ werden gerne beantwortet.

## Einschränkungen
Die bisher größte Einschränkung ist, dass der Fragenkatalog Technik A momentan noch nicht fertig ist. Dieser wird voraussichtlich zum nächsten Klasse A-Kurs in Bremen fertig.

## Technische Hintergründe
Front- und Backend sind in JavaScript geschrieben. Das Backend wird mit Node ausgeführt, das Frontend basiert auf dem React-Framework und wird in "normales" HTML/JS/CSS übersetzt. Front- und Backend kommunizieren über einen WebSocket, also eine ständig offene TCP-Verbindung. Dadurch wird eine Kommunikation aller Teilnehmer mit geringer Latenz ermöglicht.

Die Software ist absichtlich sehr datensparsam designt: Alle Teilnehmer sind nicht ohne weitere Informationen identifizierbar. Insbesondere wird keine Statistik über richtig und falsch beantwortete Fragen erstellt. Sobald ein Teilnehmer die Seite verlässt und die Verbindung geschlossen wird "vergisst" das Backend alle Daten über diesen Teilnehmer. Es werden keine Cookies gesetzt oder sonstige persistente Daten auf den Endgerät des Teilnehmers gespeichert, die ihn identifizierbar machen.

Es wurden noch keine systematischen Lasttests durchgeführt. Theoretisch sollte das System gut skalieren und auch mit vielen Teilnehmern noch performant funktionieren, da über den WebSocket bis auf ein Mal die Fragendatenbank für den Dozenten nur sehr kleine Nachrichten verschickt werden und das Backend keine besonders rechenintensiven Aufgaben durchführt. Trotzdem ist ein Lasttest geplant.

## Installation
### Voraussetzungen
Die Software besteht aus einem Frontend und einem Backend. Beide Teile sind in JavaScript geschrieben. Serverseitig wird technisch ein relativ aktuelles [Node](https://nodejs.org/en/), ein offener TCP-Port für den WebSocket und ein normaler Webserver benötigt. Optional kann TLS (HTTPS und WSS) Verschlüsselung eingeschaltet werden.

### Backend
Im Ordner `backend` muss die `main.js`-Datei angepasst werden. Zwischen den Zeilen `// Configuration` und `// End of configuration` müssen Anpassungen vorgenommen werden:

- `websocketPort`: Hier den offenen TCP-Port eintragen
- `tlsConfig`: Hier kann mit `useTLS` auf `true` die TLS-Verschlüsselung eingeschaltet werden. Wenn sie eingeschaltet ist, müssen die Variablen `cert` und `key` mit Dateinamen befüllt werden. Am Beispiel Uberspace mit Let's Encrypt wäre das `cert` auf `/home/BENUTZER/.config/letsencrypt/live/DOMAIN/cert.pem` und `key` auf `/home/BENUTZER/.config/letsencrypt/live/DOMAIN/privkey.pem`.
- `users`: Ein Array von Objekten mit `username` und `password` Schlüsseln. Das sind die Dozenten-Logins.
- `pingTest`: Der Intervall in Millisekunden, in denen über den WebSocket ein Ping-Paket geschickt wird. Wird verwendet, um kaputte Verbindungen zuverlässig zu trennen. Empfohlen wird ein Wert von 20 Sekunden (20000), maximal sollten 60 Sekunden (60000) eingetragen werden.
- `debug`: Aktiviert Debugausgaben. Im Produktivsystem i.d.R. nicht erforderlich.

Anschließend im Ordner `backend` `npm install` ausführen, was die notwendigen Dependencies installiert. Das Backend kann dann mit `npm run backend` gestartet werden. Es sollte auf dem Server als Dienst eingerichtet werden.

### Frontend
Das Frontend ist in [React](https://reactjs.org/) mit [create-react-app](https://facebook.github.io/create-react-app/) und einigen Dependencies entwickelt worden. Das Frontend kann lokal gebaut und auf einem normalen Webserver gehostet/deployt werden.

Im Ordner `frontend/src` ist die Datei `index.js` anzupassen. Hier gibt es diese Konfigurationsparameter:

- `mathJaxProvider`: Der MathJaxProvider. Entweder eine eigene Installation eintragen oder auf etwas wie `https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML` abändern.
- `webSocketPort`: Der Port, über den der WebSocket des Backends erreichbar ist, falls die automatische WebSocket-Erkennung verwendet wird. Ansonsten wird die Angabe aus dem Parameter `webSocketUrl` verwendet.
- `webSocketUrl`: Die URL, unter der der WebSocket erreichbar ist. Falls dieser unter der gleichen Domain erreichbar ist, kann das Feld leer gelassen werden. Ein Beispiel für eine valide Eingabe wäre `ws://example.com:63605/`.
- `footerLink`: Eine React-Komponente, die in den Footer der Seite eingebaut wird. Hier kann etwa ein Link auf ein eigenes Impressum und eigene Datenschutzbestimmungen gesetzt werden.
- `release`: Wenn aktiv, wird der Benutzer vor dem Verlassen der Seite gewarnt.

**Die Parameter `mathJaxProvider` und `footerLink` müssen für eine eigene Installation angepasst werden! Ich betreibe kein CDN und mein Impressum und meine Datenschutzbestimmungen gelten ausschließlich auf von mir verwalteten Domains!**

Anschließend muss auch hier `npm install` ausgeführt werden. Abschließend kann das Frontend mit `yarn build` in den Ordner `frontend/build` gebaut werden. Dort landen die Dateien, die auf den Webserver kopiert werden sollen.
