# AFU group trainer
Diese Software soll das gemeinsame Lernen für die AFU-Prüfung ermöglichen. Die Idee ist, dass bei einem Lernabend jeder die Frage beantwortet, anstatt dass sich nur einer meldet. Dadurch sollen Schwächen schneller erkannt und der Lerneffekt verbessert werden.

## Autor
Christian Friedrich Coors, Rufzeichen DL5LQ, me@dl5lq.de

## Einschränkungen
Die bisher größte Einschränkung ist, dass der Fragenkatalog Technik A momentan noch nicht fertig ist. Dieser wird voraussichtlich zum nächsten Klasse A-Kurs in Bremen fertig. Weiterhin müssen Frontend und Backend unter der gleichen Domain erreichbar sein sowie zwingend beide gleichzeitig TLS (HTTPS und WSS) ein- oder ausgeschaltet haben. Alle weiteren aktuell relevanten Einschränkungen können in den Issues zu diesem Repository eingesehen werden.

## Installation
Die Software besteht aus einem Frontend und einem Backend. Beide Teile sind in JavaScript geschrieben. Serverseitig wird technisch ein relativ aktuelles [Node](https://nodejs.org/en/), ein offener TCP-Port und ein normaler Webserver benötigt. Optional kann TLS (HTTPS) Verschlüsselung eingeschaltet werden.

### Backend
Im Ordner `backend` muss die `main.js`-Datei angepasst werden. Zwischen den Zeilen `// Configuration` und `// End of configuration` müssen Anpassungen vorgenommen werden:

- `websocketPort`: Hier den offenen TCP-Port eintragen
- `tlsConfig`: Hier kann mit `useTLS` auf `true` die TLS-Verschlüsselung eingeschaltet werden. Wenn sie eingeschaltet ist, müssen die Variablen `cert` und `key` mit Dateinamen befüllt werden. Am Beispiel Uberspace mit Let's Encrypt wäre das `cert` auf `/home/BENUTZER/.config/letsencrypt/live/DOMAIN/cert.pem` und `key` auf `/home/BENUTZER/.config/letsencrypt/live/DOMAIN/privkey.pem`.
- `users`: Ein Array von Objekten mit `username` und `password` Schlüsseln. Das sind die Dozenten-Logins.
- `pingTest`: Der Intervall in Millisekunden, in denen über den WebSocket ein Ping-Paket geschickt wird. Wird verwendet, um kaputte Verbindungen zuverlässig zu trennen. Nicht empfohlen: Ein Wert von `0` deaktiviert den Ping-Test. Momentan funktioniert der Ping-Test nur in die eine Richtung, dies wird später im Rahmen eines Tickets implementiert.
- `debug`: Aktiviert Debugausgaben. Im Produktivsystem i.d.R. nicht erforderlich.

Anschließend im Ordner `backend` `npm install` ausführen, was die notwendigen Dependencies installiert. Das Backend kann dann mit `npm run backend` gestartet werden. Es sollte auf dem Server als Dienst eingerichtet werden.

### Frontend
Das Frontend ist in [React](https://reactjs.org/) mit [create-react-app](https://facebook.github.io/create-react-app/) und einigen Dependencies entwickelt worden. Das Frontend kann lokal gebaut und auf einem normalen Webserver gehostet/deployt werden.

Im Ordner `frontend/src` ist die Datei `index.js` anzupassen. Hier gibt es 3 Konfigurationsparameter:

- `mathJaxProvider`: Der MathJaxProvider. Entweder eine eigene Installation eintragen oder auf etwas wie `https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML` abändern.
- `webSocketPort`: Der Port, über den der WebSocket des Backends erreichbar ist.
- `release`: Wenn aktiv, wird der Benutzer vor dem Verlassen der Seite gewarnt.

Momentan muss das Backend unter der gleichen Domain wie das Frontend erreichbar sein. Dies wird in einem späteren Ticket geändert.

Anschließend muss auch hier `npm install` ausgeführt werden. Abschließend kann das Frontend mit `yarn build` in den Ordner `frontend/build` gebaut werden. Dort landen die Dateien, die auf den Webserver kopiert werden sollen.
