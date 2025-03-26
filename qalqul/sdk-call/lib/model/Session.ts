
/**
 * @file Session.d.ts
 * 
 * @author Qalqul Engine
 * @createdBy Ahmed Chijai <ahmed@qalqul.io>
 * @created March, 2021
 * @lastUpdated July 2023
 * @version 1.1.0
 * 
 * @description
 * This declaration file defines the structure and functionalities related to SIP registration sessions.
 * The main class, `Registration`, provides methods to manage SIP registration operations, 
 * such as initiating a registration session, registering a session, and unregistering it.
 * 
 * @reference
 * The file refers to the 'sipml' types, which is an external dependency for the SIP functionalities.
 * 
 * @example
 * const registrationInstance = new Registration(session);
 * registrationInstance.register(configs);
 * 
 * @license
 * All rights reserved by Qalqul Engine.
 * 
 */


/// <reference types="sipml" />
export declare class Registration {
    readonly session: SIPml.Session.Registration;
    started: boolean;
    constructor(session: SIPml.Session.Registration);
    register(configs: SIPml.Session.Configuration): Promise<boolean>;
    unregister(): Promise<{}>;
}
