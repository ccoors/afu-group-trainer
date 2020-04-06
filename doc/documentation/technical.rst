Technische Hintergründe
#######################
Front- und Backend sind in JavaScript geschrieben. Das Backend wird mit Node ausgeführt, das Frontend basiert auf dem React-Framework und wird in „normales“ HTML/JS/CSS übersetzt. Front- und Backend kommunizieren über einen WebSocket, also eine ständig offene TCP-Verbindung. Dadurch wird eine Kommunikation aller Teilnehmer mit geringer Latenz ermöglicht.

Datenschutz
===========
Die Software ist absichtlich sehr datensparsam designt: Alle Teilnehmer sind nicht ohne weitere Informationen identifizierbar. Insbesondere wird keine Statistik über richtig und falsch beantwortete Fragen erstellt. Sobald ein Teilnehmer die Seite verlässt und die Verbindung geschlossen wird „vergisst“ das Backend alle Daten über diesen Teilnehmer. Es werden keine Cookies gesetzt oder sonstige persistente Daten auf den Endgerät des Teilnehmers gespeichert, die ihn identifizierbar machen.

Performance
===========
Ein erster Lasttest unter Laborbedingungen verlief positiv. Realistisch können auf durchschnittlichen Systemen einige 100 Teilnehmer das System parallel benutzen, ohne dass es zu besonders störenden Performanceproblemen kommt. Die Ergebnisse sind erwartungskonform da über den WebSocket bis auf ein Mal die Fragendatenbank für den Dozenten nur sehr kleine Nachrichten verschickt werden und das Backend keine besonders rechenintensiven Aufgaben durchführt.

API Dokumentation
=================
.. Caution:: Die API gilt noch nicht als stabil und kann sich mit jeder Version ändern!

Die Nachrichten werden mit JSON serialisiert und über eine WebSocket-Verbindung zwischen Frontend und Backend ausgetauscht.

Vom Server
----------

::

    RoomList:
        Array<Room {
            uuid: String
            name: String
            users: Int
            password_required: Bool
        }>[?]

    LoginResult:
        Bool

    JoinRoomResult:
        Bool

    CreateRoomResult:
        success: Bool
        uuid: String

    CreateQuestionListResult:
        success: Bool
        uuid: String

    UpdateQuestionListResult:
        success: Bool

    QuestionDatabase:
        Category {
            uuid: String
            id: String
            name: String
            prefix: String
            children: Array<Category>[?]
            questions: Array<Question {
                uuid: String
                id: String
                question: String
                outdated: Bool
                answers: Array<String>[4]
            }>[?]
        }

    PublicQuestionLists:
        Array<QuestionList {
            uuid: String,
            name: String,
            user: String,
            is_public: Bool,
            questions: Array<String>[?]
        }>[?]

    UserQuestionLists:
        Array<QuestionList>[?]

    RoomState:
        state: Int (0: Waiting | 1: Question | 2: Results)
        remainingQuestions: Int
        initialQuestionLength: Int
        question: {
            uuid: String
            id: String
            question: String
            outdated: Bool
            answers: Array<String>[4]
        }
        previousQuestions: Array<Question + {
            correctAnswer: Int (0 - 3)
        }>[?]
        countdown: Int | null
        userState: {
            selected: Int
            total: Int
        }
        results: {
            totalUsers: Int
            correctAnswer: Int
            selected: Array<Int>[4]
        }

    LeaveRoom:
        /

    Error:
        message: String

    KeepAlive:
        next: Int

Vom Client
----------

::

    Login:
        username: String
        password: String

    CreateRoom:
        room_name: String
        password: String

    CreateQuestionList:
        list_name: String

    UpdateQuestionList:
        list_uuid: String
        list_name: String
        is_public: Bool
        questions: Array<String>[?] (UUIDs)

    DeleteQuestionList:
        list_uuid: String

    StartQuestions:
        mode: String (plain | uuid)
     => Only when starting with UUID:
        start_uuid: String
        shuffle: Bool (only respected when starting multiple questions)
        ignore_outdated: Bool (only respected when starting multiple questions)

    ShowResults:
        /

    NextQuestion:
        /

    EndQuestions:
        /

    StartCountdown:
        time: Int

    StopCountdown:
        /

    JoinRoom:
        room_uuid: String
        password: String

    AnswerQuestion:
        id: Int

    LeaveRoom:
        /

Frontend Zustandsdiagramm
=========================

.. figure:: /graphs/frontend_states.png

    C: Nachrichten vom Client, S: Nachrichten vom Server
