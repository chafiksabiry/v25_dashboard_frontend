/**
 * @file config.d.ts
 * 
 * @author Qalqul Engine
 * @createdBy Ahmed Chijai <ahmed@qalqul.io>
 * @created March, 2021
 * @lastUpdated July 2023
 * @version 1.1.0
 * 
 * @description
 * This declaration file outlines the configurations and related structures for the manager.
 * It includes interfaces for headers, bandwidth specifications, agent details, and server configurations.
 * Additionally, a class is defined to bring all these configurations together.
 * 
 * @example
 * const myConfig = new ManagerConfigs.Configs(serverDetails, agentDetails, headers, logLevel, iceServers);
 * 
 * @license
 * All rights reserved by Qalqul Engine.
 * 
 */
export declare namespace ManagerConfigs {
    interface Header {
        name: string;
        value: string;
    }
    interface Bandwidth {
        audio: number;
        video: number;
    }
    interface Agent {
        name: string;
        username: string;
        password: string;
        sipAddress: string;
    }
    interface Server {
        realm: string;
        ws: string;
    }
    class Configs {
        readonly server: Server;
        readonly agent: Agent;
        readonly headers?: [Header] | undefined;
        readonly logLevel?: "error" | "info" | "warn" | "debug" | undefined;
        readonly iceServers: [RTCIceServer];
        constructor(server: Server, agent: Agent, headers?: [Header] | undefined, logLevel?: "error" | "info" | "warn" | "debug" | undefined, iceServers?: [RTCIceServer]);
    }
}
