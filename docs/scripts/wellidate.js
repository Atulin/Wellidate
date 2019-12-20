/*!
 * Wellidate 2.0.0
 * https://github.com/NonFactors/Wellidate
 *
 * Copyright © NonFactors
 *
 * Licensed under the terms of the MIT License
 * http://www.opensource.org/licenses/mit-license.php
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        global.Wellidate = factory();
    }
}(this, () => {
    class Wellidate {
        constructor(container, options) {
            const wellidate = this;

            if (container.dataset.valId) {
                return Wellidate.instances[parseInt(container.dataset.valId)].set(options || {});
            }

            wellidate.wasValidatedClass = Wellidate.default.classes.wasValidated;
            wellidate.inputPendingClass = Wellidate.default.classes.inputPending;
            wellidate.fieldPendingClass = Wellidate.default.classes.fieldPending;
            wellidate.inputErrorClass = Wellidate.default.classes.inputError;
            wellidate.inputValidClass = Wellidate.default.classes.inputValid;
            wellidate.fieldErrorClass = Wellidate.default.classes.fieldError;
            wellidate.fieldValidClass = Wellidate.default.classes.fieldValid;
            container.dataset.valId = Wellidate.instances.length.toString();
            wellidate.summary = wellidate.extend(Wellidate.default.summary);
            wellidate.focusCleanup = Wellidate.default.focusCleanup;
            wellidate.focusInvalid = Wellidate.default.focusInvalid;
            wellidate.excludes = Wellidate.default.excludes.slice();
            wellidate.include = Wellidate.default.include;
            wellidate.container = container;
            wellidate.validatables = [];

            if (container.tagName == 'FORM') {
                container.noValidate = true;
            }

            Wellidate.instances.push(wellidate);
            wellidate.set(options || {});
            wellidate.bind();
        }

        set(options) {
            const wellidate = this;

            wellidate.setOption('include', options.include);
            wellidate.setOption('summary', options.summary);
            wellidate.setOption('excludes', options.excludes);
            wellidate.setOption('focusCleanup', options.focusCleanup);
            wellidate.setOption('focusInvalid', options.focusInvalid);
            wellidate.setOption('fieldValidClass', options.fieldValidClass);
            wellidate.setOption('fieldErrorClass', options.fieldErrorClass);
            wellidate.setOption('inputValidClass', options.inputValidClass);
            wellidate.setOption('inputErrorClass', options.inputErrorClass);
            wellidate.setOption('fieldPendingClass', options.fieldPendingClass);
            wellidate.setOption('inputPendingClass', options.inputPendingClass);
            wellidate.setOption('wasValidatedClass', options.wasValidatedClass);

            wellidate.rebuild();

            for (const selector in options.rules) {
                wellidate.filterValidatables(selector).forEach(validatable => {
                    const element = validatable.element;

                    for (const method in options.rules[selector]) {
                        const defaultRule = Wellidate.default.rule;
                        const newRule = options.rules[selector][method];
                        const methodRule = validatable.rules[method] || Wellidate.default.rules[method] || {};

                        validatable.rules[method] = wellidate.extend(defaultRule, methodRule, newRule, { element });
                    }
                });
            }

            return wellidate;
        }

        rebuild() {
            let validatables = [];
            const wellidate = this;

            if (wellidate.container.matches(wellidate.include)) {
                const group = wellidate.buildGroupElements(wellidate.container);

                if (wellidate.container == group[0] && wellidate.validatables.length) {
                    validatables = wellidate.validatables;
                } else {
                    validatables.push(wellidate.buildValidatable(group));
                }
            } else {
                [].forEach.call(wellidate.container.querySelectorAll(wellidate.include), element => {
                    const group = wellidate.buildGroupElements(element);

                    if (element == group[0]) {
                        for (let i = 0; i < wellidate.validatables.length; i++) {
                            if (wellidate.validatables[i].element == element) {
                                validatables.push(wellidate.validatables[i]);

                                return;
                            }
                        }

                        validatables.push(wellidate.buildValidatable(group));
                    }
                });
            }

            wellidate.validatables = validatables;
        }
        form(...filter) {
            const wellidate = this;
            const result = wellidate.validate(...filter);

            result.valid.forEach(valid => {
                valid.validatable.success();
            });

            result.invalid.forEach(invalid => {
                invalid.validatable.error(invalid.method);
            });

            wellidate.summary.show(result);

            if (wellidate.focusInvalid) {
                wellidate.focus(result.invalid.map(invalid => invalid.validatable));
            }

            wellidate.container.classList.add(wellidate.wasValidatedClass);

            return !result.invalid.length;
        }
        isValid(...filter) {
            let isValid = true;

            this.filterValidatables(...filter).forEach(validatable => {
                for (const method in validatable.rules) {
                    const rule = validatable.rules[method];

                    if (rule.isEnabled() && !rule.isValid(validatable)) {
                        validatable.isValid = false;
                        isValid = false;

                        return;
                    }
                }

                validatable.isValid = true;
            });

            return isValid;
        }
        apply(results) {
            for (const selector in results) {
                this.filterValidatables(selector).forEach(validatable => {
                    const result = results[selector];

                    if (typeof result.error != 'undefined') {
                        validatable.error(null, result.error);
                    } else if (typeof result.success != 'undefined') {
                        validatable.success(result.success);
                    } else if (typeof result.reset != 'undefined') {
                        validatable.reset(result.reset);
                    }
                });
            }
        }
        validate(...filter) {
            const valid = [];
            const invalid = [];

            this.filterValidatables(...filter).forEach(validatable => {
                for (const method in validatable.rules) {
                    const rule = validatable.rules[method];

                    if (rule.isEnabled() && !rule.isValid(validatable)) {
                        invalid.push({
                            message: rule.formatMessage(),
                            validatable: validatable,
                            method: method
                        });

                        validatable.isValid = false;

                        return;
                    }
                }

                valid.push({ validatable });

                validatable.isValid = true;
            });

            return {
                isValid: !invalid.length,
                invalid: invalid,
                valid: valid
            };
        }

        reset() {
            const wellidate = this;

            wellidate.summary.reset();

            wellidate.container.classList.remove(wellidate.wasValidatedClass);

            wellidate.validatables.forEach(validatable => {
                validatable.reset();
            });
        }

        extend(...args) {
            const options = {};

            for (let i = 0; i < args.length; i++) {
                for (const key in args[i]) {
                    if (Object.prototype.toString.call(options[key]) == '[object Object]') {
                        options[key] = this.extend(options[key], args[i][key]);
                    } else {
                        options[key] = args[i][key];
                    }
                }
            }

            return options;
        }
        setOption(option, value) {
            const wellidate = this;

            if (typeof value != 'undefined') {
                if (Object.prototype.toString.call(value) == '[object Object]') {
                    wellidate[option] = wellidate.extend(wellidate[option], value);
                } else {
                    wellidate[option] = value;
                }
            }
        }

        buildRules(element) {
            return this.extend(this.buildInputRules(element), this.buildDataRules(element));
        }
        buildDataRules(element) {
            const rules = {};
            const wellidate = this;
            const defaultRule = Wellidate.default.rule;

            [].filter.call(element.attributes, attribute => /^data-val-\w+$/.test(attribute.name)).forEach(attribute => {
                const prefix = attribute.name;
                const method = prefix.substring(9);
                const rule = Wellidate.default.rules[method];

                if (rule) {
                    const dataRule = {
                        message: attribute.value || rule.message,
                        isDataMessage: Boolean(attribute.value)
                    };

                    [].forEach.call(element.attributes, parameter => {
                        if (parameter.name.indexOf(`${prefix}-`) == 0) {
                            dataRule[parameter.name.substring(prefix.length + 1)] = parameter.value;
                        }
                    });

                    rules[method] = wellidate.extend(defaultRule, rule, dataRule, { element });
                }
            });

            return rules;
        }
        buildInputRules(element) {
            const rules = {};
            const wellidate = this;
            const defaultRule = Wellidate.default.rule;
            const defaultRules = Wellidate.default.rules;

            if (element.required && defaultRules.required) {
                rules.required = wellidate.extend(defaultRule, defaultRules.required, { element });
            }

            if (element.type == 'email' && defaultRules.email) {
                rules.email = wellidate.extend(defaultRule, defaultRules.email, { element });
            }

            if (element.accept && defaultRules.accept) {
                rules.accept = wellidate.extend(defaultRule, defaultRules.accept, {
                    types: element.accept,
                    element: element
                });
            }

            if (element.getAttribute('minlength') && defaultRules.minlength) {
                rules.minlength = wellidate.extend(defaultRule, defaultRules.minlength, {
                    min: element.getAttribute('minlength'),
                    element: element
                });
            }

            if (element.getAttribute('maxlength') && defaultRules.maxlength) {
                rules.maxlength = wellidate.extend(defaultRule, defaultRules.maxlength, {
                    max: element.getAttribute('maxlength'),
                    element: element
                });
            }

            if (element.min && defaultRules.min) {
                rules.min = wellidate.extend(defaultRule, defaultRules.min, {
                    value: element.min,
                    element: element
                });
            }

            if (element.max && defaultRules.max) {
                rules.max = wellidate.extend(defaultRule, defaultRules.max, {
                    value: element.max,
                    element: element
                });
            }

            if (element.step && defaultRules.step) {
                rules.step = wellidate.extend(defaultRule, defaultRules.step, {
                    value: element.step,
                    element: element
                });
            }

            if (element.pattern && defaultRules.regex) {
                rules.regex = wellidate.extend(defaultRule, defaultRules.regex, {
                    pattern: element.pattern,
                    title: element.title,
                    element: element
                });
            }

            return rules;
        }
        buildValidatable(group) {
            const wellidate = this;
            const groupValidatable = {
                isValid: true,
                isDirty: false,
                elements: group,
                element: group[0],
                wellidate: wellidate,
                rules: wellidate.buildRules(group[0]),
                errorContainers: wellidate.buildErrorContainers(group[0]),

                validate() {
                    const validatable = this;

                    validatable.isValid = true;

                    for (const method in validatable.rules) {
                        const rule = validatable.rules[method];

                        if (rule.isEnabled() && !rule.isValid(validatable)) {
                            validatable.isValid = false;
                            validatable.error(method);

                            break;
                        }
                    }

                    if (validatable.isValid) {
                        validatable.success();
                    }

                    return validatable.isValid;
                },

                error(method, message) {
                    const validatable = this;
                    const rule = validatable.rules[method];
                    const formattedMessage = message || rule.formatMessage();

                    validatable.isDirty = true;
                    validatable.element.setCustomValidity(formattedMessage);

                    validatable.elements.forEach(element => {
                        element.classList.add(wellidate.inputErrorClass);
                        element.classList.remove(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputPendingClass);
                    });

                    validatable.errorContainers.forEach(container => {
                        container.classList.remove(wellidate.fieldPendingClass);
                        container.classList.remove(wellidate.fieldValidClass);
                        container.classList.add(wellidate.fieldErrorClass);
                        container.innerHTML = formattedMessage;
                    });

                    validatable.element.dispatchEvent(new CustomEvent('wellidate-error', {
                        detail: {
                            message: formattedMessage,
                            validatable: validatable,
                            method: method
                        },
                        bubbles: true
                    }));
                },
                pending(message) {
                    this.elements.forEach(element => {
                        element.classList.add(wellidate.inputPendingClass);
                        element.classList.remove(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputErrorClass);
                    });

                    this.errorContainers.forEach(container => {
                        container.classList.remove(wellidate.fieldErrorClass);
                        container.classList.remove(wellidate.fieldValidClass);
                        container.classList.add(wellidate.fieldPendingClass);
                        container.innerHTML = message || '';
                    });

                    this.element.dispatchEvent(new CustomEvent('wellidate-pending', {
                        detail: { validatable: this },
                        bubbles: true
                    }));
                },
                success(message) {
                    const validatable = this;

                    validatable.element.setCustomValidity('');

                    validatable.elements.forEach(element => {
                        element.classList.add(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputErrorClass);
                        element.classList.remove(wellidate.inputPendingClass);
                    });

                    validatable.errorContainers.forEach(container => {
                        container.classList.remove(wellidate.fieldPendingClass);
                        container.classList.remove(wellidate.fieldErrorClass);
                        container.classList.add(wellidate.fieldValidClass);
                        container.innerHTML = message || '';
                    });

                    validatable.element.dispatchEvent(new CustomEvent('wellidate-success', {
                        detail: { validatable },
                        bubbles: true
                    }));
                },
                reset() {
                    const validatable = this;

                    validatable.isDirty = false;
                    validatable.element.setCustomValidity('');

                    validatable.elements.forEach(element => {
                        element.classList.remove(wellidate.inputErrorClass);
                        element.classList.remove(wellidate.inputValidClass);
                        element.classList.remove(wellidate.inputPendingClass);
                    });

                    validatable.errorContainers.forEach(container => {
                        container.classList.remove(wellidate.fieldPendingClass);
                        container.classList.remove(wellidate.fieldErrorClass);
                        container.classList.remove(wellidate.fieldValidClass);
                        container.innerHTML = '';
                    });

                    validatable.element.dispatchEvent(new CustomEvent('wellidate-reset', {
                        detail: { validatable },
                        bubbles: true
                    }));
                }
            };

            wellidate.bindUnobstrusive(groupValidatable);

            return groupValidatable;
        }
        buildGroupElements(group) {
            if (group.name) {
                const name = this.escapeAttribute(group.name);

                return [].map.call(document.querySelectorAll(`[name="${name}"]`), element => element);
            }

            return [group];
        }
        buildErrorContainers(element) {
            if (element.name) {
                const name = this.escapeAttribute(element.name);

                return [].map.call(document.querySelectorAll(`[data-valmsg-for="${name}"]`), container => container);
            }

            return [];
        }

        focus(errors) {
            if (errors.length) {
                let invalid = errors[0];

                for (let i = 1; i < errors.length; i++) {
                    if (this.lastActive == errors[i].element) {
                        invalid = errors[i];

                        break;
                    } else if (invalid.element.compareDocumentPosition(errors[i].element) == 2) {
                        invalid = errors[i];
                    }
                }

                this.lastActive = invalid.element;

                if (this.focusCleanup) {
                    invalid.reset();
                }

                invalid.element.focus();
            }
        }
        isExcluded(element) {
            for (let i = 0; i < this.excludes.length; i++) {
                if (element.matches(this.excludes[i])) {
                    return false;
                }
            }

            return false;
        }
        escapeAttribute(name) {
            return name.replace(/(["\]\\])/g, '\\$1');
        }
        filterValidatables(...filter) {
            const wellidate = this;
            const selectors = Array.isArray(filter[0]) ? filter[0] : filter;

            return wellidate.validatables.filter(validatable => {
                for (let i = 0; i < selectors.length; i++) {
                    if (validatable.element.matches(selectors[i])) {
                        return true;
                    }
                }

                return !selectors.length;
            }).filter(validatable => !wellidate.isExcluded(validatable.element));
        }

        bindUnobstrusive(validatable) {
            const wellidate = this;
            const input = validatable.element;
            const event = input.tagName == 'SELECT' || input.type == 'hidden' ? 'change' : 'input';

            validatable.elements.forEach(element => {
                element.addEventListener(event, () => {
                    if (element.type == 'hidden' || validatable.isDirty) {
                        validatable.validate();
                    }
                });

                element.addEventListener('focus', function () {
                    if (wellidate.focusCleanup) {
                        validatable.reset();
                    }

                    wellidate.lastActive = this;
                });

                element.addEventListener('blur', function () {
                    if (validatable.isDirty || this.value.length) {
                        validatable.isDirty = !validatable.validate();
                    }
                });
            });
        }
        bind() {
            const wellidate = this;

            if (wellidate.container.tagName == 'FORM') {
                wellidate.container.addEventListener('submit', function (e) {
                    if (wellidate.form()) {
                        this.dispatchEvent(new CustomEvent('wellidate-valid', {
                            detail: { wellidate },
                            bubbles: true
                        }));

                        if (wellidate.submitHandler) {
                            e.preventDefault();

                            wellidate.submitHandler();
                        }
                    } else {
                        e.preventDefault();

                        this.dispatchEvent(new CustomEvent('wellidate-invalid', {
                            detail: { wellidate },
                            bubbles: true
                        }));
                    }
                });

                wellidate.container.addEventListener('reset', () => {
                    wellidate.reset();
                });
            }
        }
    }

    Wellidate.default = {
        focusInvalid: true,
        focusCleanup: false,
        include: 'input,textarea,select',
        summary: {
            container: '[data-valmsg-summary=true]',
            show(result) {
                if (this.container) {
                    const summary = document.querySelector(this.container);

                    if (summary) {
                        summary.innerHTML = '';

                        if (result.isValid) {
                            summary.classList.add('validation-summary-valid');
                            summary.classList.remove('validation-summary-errors');
                        } else {
                            summary.classList.add('validation-summary-errors');
                            summary.classList.remove('validation-summary-valid');

                            const list = document.createElement('ul');

                            result.invalid.forEach(invalid => {
                                const item = document.createElement('li');

                                item.innerHTML = invalid.message;

                                list.appendChild(item);
                            });

                            summary.appendChild(list);
                        }
                    }
                }
            },
            reset() {
                this.show({
                    isValid: true,
                    invalid: [],
                    valid: []
                });
            }
        },
        classes: {
            inputPending: 'input-validation-pending',
            inputError: 'input-validation-error',
            inputValid: 'input-validation-valid',
            fieldPending: 'input-validation-pending',
            fieldError: 'field-validation-error',
            fieldValid: 'field-validation-valid',
            wasValidated: 'was-validated'
        },
        excludes: [
            'input[type=button]',
            'input[type=submit]',
            'input[type=image]',
            'input[type=reset]',
            ':disabled'
        ],
        rule: {
            trim: true,
            message: 'This field is not valid.',
            isValid() {
                return false;
            },
            isEnabled() {
                return true;
            },
            formatMessage() {
                return this.message;
            },
            normalizeValue(element) {
                const input = element || this.element;
                let { value } = input;

                if (input.tagName == 'SELECT' && input.multiple) {
                    return [].filter.call(input.options, option => option.selected).length;
                } else if (input.type == 'radio') {
                    if (input.name) {
                        const name = this.wellidate.escapeAttribute(input.name);
                        const checked = document.querySelector(`input[name="${name}"]:checked`);

                        value = checked ? checked.value : '';
                    } else {
                        value = input.checked ? value : '';
                    }
                } else if (input.type == 'file') {
                    if (value.lastIndexOf('\\') >= 0) {
                        value = value.substring(value.lastIndexOf('\\') + 1);
                    } else if (value.lastIndexOf('/') >= 0) {
                        value = value.substring(value.lastIndexOf('/') + 1);
                    }
                }

                return this.trim ? value.trim() : value;
            }
        },
        rules: {
            required: {
                message: 'This field is required.',
                isValid() {
                    return Boolean(this.normalizeValue());
                }
            },
            equalto: {
                message: 'Please enter the same value again.',
                isValid() {
                    const other = document.getElementById(this.other);

                    return other && this.normalizeValue() == this.normalizeValue(other);
                }
            },
            length: {
                message: 'Please enter a value between {0} and {1} characters long.',
                isValid() {
                    const length = this;
                    const value = length.normalizeValue();

                    return (length.min == null || length.min <= value.length) && (value.length <= length.max || length.max == null);
                },
                formatMessage() {
                    const length = this;

                    if (length.min != null && length.max == null && !length.isDataMessage) {
                        return Wellidate.default.rules.minlength.message.replace('{0}', length.min);
                    } else if (length.min == null && length.max != null && !length.isDataMessage) {
                        return Wellidate.default.rules.maxlength.message.replace('{0}', length.max);
                    }

                    return length.message.replace('{0}', length.min).replace('{1}', length.max);
                }
            },
            minlength: {
                message: 'Please enter at least {0} characters.',
                isValid() {
                    return this.min <= this.normalizeValue().length;
                },
                formatMessage() {
                    return this.message.replace('{0}', this.min);
                }
            },
            maxlength: {
                message: 'Please enter no more than {0} characters.',
                isValid() {
                    return this.normalizeValue().length <= this.max;
                },
                formatMessage() {
                    return this.message.replace('{0}', this.max);
                }
            },
            email: {
                message: 'Please enter a valid email address.',
                isValid() {
                    return /^$|^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(this.normalizeValue());
                }
            },
            integer: {
                message: 'Please enter a valid integer value.',
                isValid() {
                    return /^$|^[+-]?\d+$/.test(this.normalizeValue());
                }
            },
            number: {
                message: 'Please enter a valid number.',
                scaleMessage: 'Please enter a value with no more than {0} fractional digits',
                precisionMessage: 'Please enter a value using no more than {0} significant digits',
                isValid() {
                    const number = this;
                    const scale = parseInt(number.scale);
                    const value = number.normalizeValue();
                    const precision = parseInt(number.precision);
                    let isValid = /^$|^[+-]?(\d+|\d{1,3}(,\d{3})+)?(\.\d+)?$/.test(value);

                    if (isValid && value && precision > 0) {
                        number.isValidPrecision = number.digits(value.split('.')[0].replace(/^[-+,0]+/, '')) <= precision - (scale || 0);
                        isValid = isValid && number.isValidPrecision;
                    } else {
                        number.isValidPrecision = true;
                    }

                    if (isValid && value.indexOf('.') >= 0 && scale >= 0) {
                        number.isValidScale = number.digits(value.split('.')[1].replace(/0+$/, '')) <= scale;
                        isValid = isValid && number.isValidScale;
                    } else {
                        number.isValidScale = true;
                    }

                    return isValid;
                },
                digits(value) {
                    return value.split('').filter(e => !isNaN(parseInt(e))).length;
                },
                formatMessage() {
                    const number = this;

                    if (number.isValidPrecision === false && !number.isDataMessage) {
                        return number.precisionMessage.replace('{0}', parseInt(number.precision) - (parseInt(number.scale) || 0));
                    } else if (number.isValidScale === false && !number.isDataMessage) {
                        return number.scaleMessage.replace('{0}', parseInt(number.scale) || 0);
                    }

                    return number.message;
                }
            },
            digits: {
                message: 'Please enter only digits.',
                isValid() {
                    return /^\d*$/.test(this.normalizeValue());
                }
            },
            date: {
                message: 'Please enter a valid date.',
                isValid() {
                    return /^$|^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(this.normalizeValue());
                }
            },
            range: {
                message: 'Please enter a value between {0} and {1}.',
                isValid() {
                    const min = parseFloat(this.min);
                    const max = parseFloat(this.max);
                    const value = this.normalizeValue();

                    return !value || (min == null || min <= value) && (value <= max || max == null);
                },
                formatMessage() {
                    const range = this;

                    if (range.min != null && range.max == null && !range.isDataMessage) {
                        return Wellidate.default.rules.min.message.replace('{0}', range.min);
                    } else if (range.min == null && range.max != null && !range.isDataMessage) {
                        return Wellidate.default.rules.max.message.replace('{0}', range.max);
                    }

                    return range.message.replace('{0}', range.min).replace('{1}', range.max);
                }
            },
            min: {
                message: 'Please enter a value greater than or equal to {0}.',
                isValid() {
                    const value = this.normalizeValue();

                    return !value || parseFloat(this.value) <= value;
                },
                formatMessage() {
                    return this.message.replace('{0}', this.value);
                }
            },
            max: {
                message: 'Please enter a value less than or equal to {0}.',
                isValid() {
                    const value = this.normalizeValue();

                    return !value || value <= parseFloat(this.value);
                },
                formatMessage() {
                    return this.message.replace('{0}', this.value);
                }
            },
            greater: {
                message: 'Please enter a value greater than {0}.',
                isValid() {
                    const value = this.normalizeValue();

                    return !value || parseFloat(this.than) < value;
                },
                formatMessage() {
                    return this.message.replace('{0}', this.than);
                }
            },
            lower: {
                message: 'Please enter a value lower than {0}.',
                isValid() {
                    const value = this.normalizeValue();

                    return !value || value < parseFloat(this.than);
                },
                formatMessage() {
                    return this.message.replace('{0}', this.than);
                }
            },
            step: {
                message: 'Please enter a multiple of {0}.',
                isValid() {
                    const value = this.normalizeValue();

                    return !value || value % parseInt(this.value) == 0;
                },
                formatMessage() {
                    return this.message.replace('{0}', this.value);
                }
            },
            filesize: {
                page: 1024,
                message: 'File size should not exceed {0} MB.',
                isValid() {
                    const size = [].reduce.call(this.element.files, (total, file) => total + file.size, 0);

                    return size <= this.max || this.max == null;
                },
                formatMessage() {
                    const filesize = this;
                    const mb = (filesize.max / filesize.page / filesize.page).toFixed(2);

                    return filesize.message.replace('{0}', mb.replace(/[.|0]*$/, ''));
                }
            },
            accept: {
                message: 'Please select files in correct format.',
                isValid() {
                    const filter = this.types.split(',').map(type => type.trim());

                    const correct = [].filter.call(this.element.files, file => {
                        const extension = file.name.split('.').pop();

                        for (let i = 0; i < filter.length; i++) {
                            if (filter[i].indexOf('.') == 0) {
                                if (file.name != extension && `.${extension}` == filter[i]) {
                                    return true;
                                }
                            } else if (/\/\*$/.test(filter[i])) {
                                if (file.type.indexOf(filter[i].replace(/\*$/, '')) == 0) {
                                    return true;
                                }
                            } else if (file.type == filter[i]) {
                                return true;
                            }
                        }

                        return !filter.length;
                    });

                    return this.element.files.length == correct.length;
                }
            },
            regex: {
                message: 'Please enter value in a valid format. {0}',
                isValid() {
                    const value = this.normalizeValue();

                    return !value || !this.pattern || new RegExp(this.pattern).test(value);
                },
                formatMessage() {
                    return this.message.replace('{0}', this.title || '');
                }
            },
            remote: {
                type: 'get',
                message: 'Please fix this field.',
                isValid(validatable) {
                    const remote = this;

                    if (remote.controller) {
                        remote.controller.abort();
                    }

                    clearTimeout(remote.start);
                    remote.start = setTimeout(() => {
                        if (validatable.isValid) {
                            remote.controller = new AbortController();

                            fetch(remote.buildUrl(), {
                                method: remote.type,
                                headers: { 'X-Requested-With': 'XMLHttpRequest' }
                            }).then(response => {
                                if (validatable.isValid && response.ok) {
                                    return response.text();
                                }

                                return '';
                            }).then(response => {
                                if (response) {
                                    remote.apply(validatable, response);
                                }
                            });

                            remote.prepare(validatable);

                            validatable.pending();
                        }
                    }, 1);

                    return true;
                },
                buildUrl() {
                    const remote = this;
                    const url = remote.url.split('?', 2)[0];
                    const query = new URLSearchParams(remote.url.split('?', 2)[1] || '');
                    const fields = (remote.additionalFields || '').split(',').filter(Boolean);

                    for (let i = 0; i < fields.length; i++) {
                        const element = document.querySelector(fields[i]);
                        const value = remote.normalizeValue(element) || '';

                        query.append(element.name, value);
                    }

                    query.append(remote.element.name, remote.normalizeValue() || '');

                    return `${url}?${query.toString()}`;
                },
                prepare() {
                },
                apply(validatable, response) {
                    const result = JSON.parse(response);

                    if (result.isValid === false) {
                        validatable.error('remote', result.message);
                    } else {
                        validatable.success(result.message);
                    }
                }
            }
        }
    };
    Wellidate.instances = [];

    return Wellidate;
}));
