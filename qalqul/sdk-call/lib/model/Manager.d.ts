/**
 * @file Manager.ts
 * 
 * @author Qalqul Engine
 * @createdBy Ahmed Chijai <ahmed@qalqul.io>
 * @created March, 2021
 * @lastUpdated July 2023
 * @version 1.1.0
 * 
 * @description
 * This declaration file provides the structure for the Manager functionalities in the context of a SIP-based application.
 * The main class defined is `Client` which provides methods to manage SIP client operations such as connection, 
 * registration, making calls, and subscribing to call events. It also integrates with external libraries such as SIPml and RxJS.
 * 
 * @reference
 * The file refers to the 'sipml' types and the '@qalqul/sipml' module, which are external dependencies for the SIP functionalities.
 * 
 * @example
 * const clientInstance = Manager.Client.connect(config);
 * 
 * @license
 * All rights reserved by Qalqul Engine.
 * 
 */

/// <reference types="sipml" />
import { ManagerConfigs } from "./Configs";
import SIPml from '@qalqul/sipml';
import { Subscription } from "rxjs";
import { Calls } from "./Call";
import { Events } from "./Events";
export declare namespace Manager {
    class Client {
        static connect(config: ManagerConfigs.Configs): Promise<Client>;
        private stack;
        private publish;
        private registration;
        constructor(configs: ManagerConfigs.Configs);
        private start;
        register(configs?: SIPml.Session.Configuration): Promise<void>;
        unregister(): Promise<{}>;
        call(recipient: string, headers?: ManagerConfigs.Header[]): Calls.Call;
        subscribe(observer: (call: Calls.Call) => void, error: (error: {
            type: Events.StackError;
            description: String;
        }) => void, complete: (() => void)): Subscription;
        stop(timeout: number | undefined): void;
    }
}