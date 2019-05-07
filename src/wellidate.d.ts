interface WellidateRule {
    trim: boolean;
    message: string;
    [parameter: string]: any;

    isEnabled(): boolean;
    formatMessage(): string;
    normalizeValue(element?: HTMLElement): any;
    isValid(validatable: WellidateValidatable): boolean;
}

interface WellidateSummary {
    container: string;

    reset(): void;
    show(result: WellidateResults): void;
}

interface WellidateOptions {
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

    rules: {
        [method: string]: WellidateRule
    };
}

interface WellidateValidatable {
    isValid: boolean;
    isDirty: boolean;

    wellidate: Wellidate;
    element: HTMLElement;
    elements: HTMLElement[];
    errorContainers: HTMLElement[];
    rules: {
        [method: string]: WellidateRule
    };

    validate(): boolean;

    reset(message?: string): void;
    success(message?: string): void;
    pending(message?: string): void;
    error(method: string | null, message?: string): void;
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
    }
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
}

declare class Wellidate {
    static instances: Wellidate[];
    static rules: { [method: string]: WellidateRule };

    container: HTMLElement;
    lastActive?: HTMLElement;
    summary: WellidateSummary;
    submitHandler?: () => void;
    validatables: WellidateValidatable[];

    focusInvalid: boolean;
    focusCleanup: boolean;

    include: string;
    excludes: string[];

    inputPendingClass: string;
    inputErrorClass: string;
    inputValidClass: string;
    fieldPendingClass: string;
    fieldErrorClass: string;
    fieldValidClass: string;
    wasValidatedClass: string;

    constructor(container: HTMLElement, options: WellidateOptions);

    set(options: WellidateOptions): this;

    rebuild(): void;
    form(...filter: string[]): boolean;
    isValid(...filter: string[]): boolean;
    apply(results: WellidateApplyResults): void;
    validate(...filter: string[]): WellidateResults;

    reset(): void;

    private extend(root: any, ...args: any[]);
    private setOption(key: string, value: any);

    private buildGroupElements(group: HTMLElement[]): HTMLElement[];
    private buildErrorContainers(element: HTMLElement): HTMLElement[];
    private buildValidatable(group: HTMLElement[]): WellidateValidatable[];
    private buildRules(element: HTMLElement): { [method: string]: WellidateRule };
    private buildDataRules(element: HTMLElement): { [method: string]: WellidateRule };
    private buildInputRules(element: HTMLElement): { [method: string]: WellidateRule };

    private escapeAttribute(name: string): string;
    private isExcluded(element: HTMLElement): boolean;
    private focus(invalid: WellidateValidatable[]): void;
    private filterValidatables(...filter: string[]): WellidateValidatable[];
    private dispatchEvent(element: HTMLElement, type: string, detail: any): void;

    private bindUnobstrusive(validatable: WellidateValidatable): void;
    private bind(): void;
}
