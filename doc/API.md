# AFU group trainer WebSocket API 0.4.1

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

## From user

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

    JoinRoom:
        room_uuid: String
        password: String
    
    AnswerQuestion:
        id: Int
    
    LeaveRoom:
        /
