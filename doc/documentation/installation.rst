Installationsanleitung
######################
.. Caution:: Die Software wird momentan aktiv weiterentwickelt. Eine eigene Installation kann daher nicht uneingeschränkt empfohlen werden, wenn man ständig die aktuelle Version verwenden möchte.

Voraussetzungen
===============
Die Software besteht aus einem Frontend und einem Backend. Beide Teile sind in JavaScript geschrieben. Serverseitig wird technisch ein relativ aktuelles `Node`_, ein offener TCP-Port für den WebSocket und ein normaler Webserver benötigt. Optional kann TLS (HTTPS und WSS) Verschlüsselung eingeschaltet werden.

Backend
=======
Im Ordner ``backend`` muss die ``config.js``-Datei angepasst werden. Hier können einige Anpassungen vorgenommen werden:

- ``config.websocketPort``: Hier den offenen TCP-Port eintragen
- ``config.tlsConfig``: Hier kann mit ``useTLS`` auf ``true`` die TLS-Verschlüsselung eingeschaltet werden. Wenn sie eingeschaltet ist, müssen die Variablen ``cert`` und ``key`` mit Dateinamen befüllt werden. Am Beispiel Uberspace 6 mit Let's Encrypt wäre das ``cert`` auf ``/home/BENUTZER/.config/letsencrypt/live/DOMAIN/cert.pem`` und ``key`` auf ``/home/BENUTZER/.config/letsencrypt/live/DOMAIN/privkey.pem``.
- ``config.users``: Ein Array von Objekten mit ``username`` und ``password`` Schlüsseln. Das sind die Dozenten-Logins.
- ``config.pingTest``: Der Intervall in Millisekunden, in denen über den WebSocket ein Ping-Paket geschickt wird. Wird verwendet, um kaputte Verbindungen zuverlässig zu trennen. Empfohlen wird ein Wert von 20 Sekunden (20000), maximal sollten 60 Sekunden (60000) eingetragen werden. Ein zu kleiner Wert führt zu Problemen! Hier sollten als absolute Untergrenze 10 Sekunden (10000) eingetragen werden.
- ``config.debug``: Aktiviert Debugausgaben. Im Produktivsystem i.d.R. nicht erforderlich.
- ``config.questions``: Die Fragenkataloge, die geladen werden sollen. I.d.R. ist eine Anpassung nicht erforderlich.

Anschließend im Ordner ``backend`` ``npm install`` ausführen, was die notwendigen Dependencies installiert. Das Backend kann dann mit ``npm run backend`` gestartet werden. Es sollte auf dem Server als Dienst eingerichtet werden.

Frontend
========
Das Frontend ist in `React`_ mit `Create React App`_ und einigen Dependencies entwickelt worden. Das Frontend kann lokal gebaut und auf einen normalen Webserver gehostet/deployt werden.

Im Ordner ``frontend/src`` ist die Datei ``config.js`` anzupassen. Hier gibt es diese Konfigurationsparameter:

- ``config.mathJaxProvider``: Der MathJaxProvider. Entweder eine eigene Installation eintragen oder auf etwas wie ``https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML`` abändern.
- ``config.webSocketPort``: Der Port, über den der WebSocket des Backends erreichbar ist, falls die automatische WebSocket-Erkennung verwendet wird. Ansonsten wird die Angabe aus dem Parameter ``webSocketUrl`` verwendet.
- ``config.webSocketUrl``: Die URL, unter der der WebSocket erreichbar ist. Falls dieser unter der gleichen Domain erreichbar ist, kann das Feld leer gelassen werden. Ein Beispiel für eine valide Eingabe wäre ``ws://example.com:63605/``.
- ``config.footerLink``: Eine React-Komponente, die in den Footer der Seite eingebaut wird. Hier kann etwa ein Link auf ein eigenes Impressum und eigene Datenschutzbestimmungen gesetzt werden. Wenn nicht benötigt, hier ``null`` eintragen.
- ``config.release``: Wenn aktiv, wird der Benutzer vor dem Verlassen der Seite gewarnt.

.. Attention:: Der Parameter ``footerLink`` sollte für eine eigene Installation angepasst werden!

Dann muss in der Datei ``frontend/package.json`` noch der Parameter ``homepage`` auf die URL angepasst werden, unter der der AGT später verfügbar sein soll, damit die relativen Links richtig gesetzt werden.

Anschließend muss auch hier ``npm install`` ausgeführt werden. Dann kann das Frontend mit ``yarn build`` in den Ordner ``frontend/build`` gebaut werden. Dort landen die Dateien, die auf den Webserver kopiert werden sollen.

.. _Node: https://nodejs.org/en/
.. _React: https://reactjs.org/
.. _Create React App: https://facebook.github.io/create-react-app/
