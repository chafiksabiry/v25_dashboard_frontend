/**
 * @file Calls.d.ts
 * 
 * @author Qalqul Engine
 * @createdBy Ahmed Chijai <ahmed@qalqul.io>
 * @created March, 2021
 * @lastUpdated July 2023
 * @version 1.1.0
 * 
 * @description
 * This file provides a comprehensive set of tools and structures to manage calls using SIPml. 
 * It defines various call types, events, status enums, and classes to handle call duration, 
 * call operations like muting, holding, and more. The file also integrates with RxJS for event management.
 * 
 * @reference
 * The file refers to the 'sipml' types, which are external types defined for the SIPml library.
 * 
 * @example
 * const callInstance = new Calls.Call(session, number, type, headers, element);
 * 
 * @license
 * All rights reserved by Qalqul Engine.
 * 
 */

/// <reference types="sipml" />
import { Subscription } from "rxjs";
import { ManagerConfigs } from "./Configs";
export declare namespace Calls {
    enum CallTypes {
        INCOMING = "INCOMING",
        OUTGOING = "OUTGOING"
    }
    enum Events {
        HOLD = "hold",
        MUTE = "mute",
        ERROR = "error",
        STATUS = "status"
    }
    interface Update {
        type: Events;
        value: boolean | Status;
    }
    enum Status {
        NONE = "NONE",
        CONNECTING = "CONNECTING",
        RINGING = "RINGING",
        CONNECTED = "CONNECTED",
        TRANSFERRING = "TRANSFERRING",
        TRANSFERRED = "TRANSFERRED",
        TERMINATING = "TERMINATING",
        TERMINATED = "TERMINATED"
    }
    class Duration {
        readonly since: Map<string, number>;
        readonly diffs: Map<string, number>;
        constructor();
        /**
         * @param type
         * @returns {number} Returns the total time of the duration type
         */
        get(type: string): number;
        start(type: string): void;
        stop(type: string): void;
        stopAll(): void;
        list(): {};
    }
    interface Transfer {
        accept(): Call;
        reject(): void;
    }
    class Call {
        protected session: SIPml.Session.Call;
        number: string;
        type: Calls.CallTypes;
        headers: object;
        private element;
        private publisher;
        status: Status;
        muted: boolean;
        onHold: boolean;
        durations: Duration;
        constructor(session: SIPml.Session.Call, number: string, type: Calls.CallTypes, headers: object, element: HTMLElement | any);
        accept(): void;
        mute(): void;
        unMute(): void;
        hangup(): void;
        hold(): void;
        resume(): void;
        dtmf(tone: number): void;
        transfer(recipient: number, headers?: ManagerConfigs.Header[]): void;
        isMuted(): boolean;
        isOnHold(): boolean;
        subscribe(subscriber: (event: Update) => void): Subscription;
        private registerEventListeners;
        private publishCallStatus;
    }
}
