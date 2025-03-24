/**
 * @file Audios.d.ts
 * 
 * @author Qalqul Engine
 * @createdBy Ahmed Chijai <ahmed@qalqul.io>
 * @created March, 2021
 * @lastUpdated July 2023
 * @version 1.1.0
 * 
 * @description
 * The Audios class provides utility methods to manage audio elements. 
 * It offers functionalities like adding and removing audio elements based 
 * on unique IDs or HTMLElement references.
 * 
 * @example
 * const audioElement = Audios.add('unique-audio-id');
 * Audios.remove(audioElement);
 * 
 * @license
 * All rights reserved by Qalqul Engine.
 * 
 */

export declare class Audios {
    /**
     * @param id A unique id of audio element
     */
    static add(id: string): HTMLElement | null;
    static remove(element: HTMLElement): void;
}
