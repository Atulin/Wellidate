/*!
 * Wellidate 2.0.0
 * https://github.com/NonFactors/Wellidate
 *
 * Copyright © NonFactors
 *
 * Licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
interface WellidateRule {
    trim: boolean;
    message: string;
    [parameter: string]: any;
    isEnabled(): boolean;
    formatMessage(): string;
    normalizeValue(element?: HTMLElement): string;
    isValid(validatable: WellidateValidatable): boolean;
}
interface WellidateRules {
    [method: string]: WellidateRule;
}
interface WellidateSummary {
    container: string;
    show(result: WellidateResults): void;
    reset(): void;
}
interface WellidateResults {
    isValid: boolean;
    invalid: {
        method: string;
        message: string;
        validatable: WellidateValidatable;
    }[];
    valid: {
        validatable: WellidateValidatable;
    }[];
}
interface WellidateApplyResults {
    [selector: string]: {
        error?: string;
        reset?: string;
        success?: string;
    };
}
interface WellidateDefaults {
    focusInvalid: boolean;
    focusCleanup: boolean;
    include: string;
    excludes: string[];
    summary: WellidateSummary;
    classes: {
        inputPending: string;
        inputError: string;
        inputValid: string;
        fieldPending: string;
        fieldError: string;
        fieldValid: string;
        wasValidated: string;
    };
    rule: WellidateRule;
    rules: {
        [method: string]: any;
    };
}
declare class WellidateOptions {
    rules: WellidateRules;
    summary: WellidateSummary;
    include: string;
    excludes: string[];
    focusCleanup: boolean;
    focusInvalid: boolean;
    fieldValidClass: string;
    fieldErrorClass: string;
    inputValidClass: string;
    inputErrorClass: string;
    fieldPendingClass: string;
    inputPendingClass: string;
    wasValidatedClass: string;
}
export declare class WellidateValidatable {
    isValid: boolean;
    isDirty: boolean;
    wellidate: Wellidate;
    rules: WellidateRules;
    element: HTMLInputElement;
    elements: HTMLInputElement[];
    errorContainers: HTMLElement[];
    constructor(wellidate: Wellidate, group: HTMLInputElement[]);
    validate(): boolean;
    reset(message?: string): void;
    pending(message?: string): void;
    success(message?: string): void;
    error(method: string | null, message?: string): void;
    private buildErrorContainers;
    private buildInputRules;
    private buildDataRules;
    private build;
    private bind;
}
export declare class Wellidate extends WellidateOptions {
    static default: WellidateDefaults;
    private static instances;
    container: HTMLElement;
    lastActive?: HTMLElement;
    submitHandler?: () => void;
    validatables: WellidateValidatable[];
    [option: string]: [keyof Wellidate];
    constructor(container: HTMLElement, options?: Partial<WellidateOptions>);
    set(options: Partial<WellidateOptions>): this;
    rebuild(): void;
    form(...filter: string[]): boolean;
    isValid(...filter: string[]): boolean;
    apply(results: WellidateApplyResults): void;
    validate(...filter: string[]): WellidateResults;
    reset(): void;
    private extend;
    private setOption;
    private buildGroupElements;
    private focus;
    private isExcluded;
    private filterValidatables;
    private bind;
}
export {};
