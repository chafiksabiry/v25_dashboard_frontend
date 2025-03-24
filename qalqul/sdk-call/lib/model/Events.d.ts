/**
 * @file Events.d.ts
 * 
 * @author Qalqul Engine
 * @createdBy Ahmed Chijai <ahmed@qalqul.io>
 * @created March, 2021
 * @lastUpdated July 2023
 * @version 1.1.0
 * 
 * @description
 * This declaration file defines the various events related to SIP sessions and potential stack errors.
 * The `Sessions` enum lists down the types of session events, including messaging, publishing, registering, 
 * and various call types. The `StackError` enum captures the different types of errors that might occur 
 * within the SIP stack.
 * 
 * @example
 * if (eventType === Events.Sessions.MESSAGE) { ... }
 * if (errorType === Events.StackError.MEDIA_DENIED) { ... }
 * 
 * @license
 * All rights reserved by Qalqul Engine.
 * 
 */
export declare namespace Events {
    enum Sessions {
        MESSAGE = "message",
        PUBLISH = "publish",
        REGISTER = "register",
        SUBSCRIBE = "subscriber",
        AUDIO_CALL = "call-audio",
        VIDEO_CALL = "call-video",
        SCREEN_SHARE = "call-screenshare",
        AUDIO_VIDEO_CALL = "call-audiovideo"
    }
    enum StackError {
        MEDIA_DENIED = "media:denied",
        REGISTRATION = "registration:error",
        WEBRTC_ERROR = "webrtc:error",
        TRANSPORT_ERROR = "transport:error"
    }
}
