# afu-group-trainer WebSocket API 0.2.1

## From server

    RoomList:
        Array<Room {
            uuid: String
            name: String
            users: Int
            password_required: Bool
        }>[?]
    
    LoginResult:
        Bool
    
    RoomJoinResult:
        Bool
    
    CreateRoomResult:
        success: Bool
        uuid: String
        
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
        
    AdminRoomStatus:
        selected: Int
        total: Int
    
    RoomState:
        mode: Int (0: Waiting | 1: Question | 2: Results)
        remainingQuestions: Int
        initialQuestionLength: int
        question: {
            uuid: String
            id: String
            question: String
            outdated: Bool
            answers: Array<String>[4]
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

## From user

    Login:
        username: String
        password: String
    
    CreateRoom:
        room_name: String
        password: String
    
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

    JoinRoom:
        room_uuid: String
        password: String
    
    AnswerQuestion:
        id: Int
    
    LeaveRoom:
        /
