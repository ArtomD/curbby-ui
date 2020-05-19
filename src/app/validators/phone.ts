import { AbstractControl, ValidatorFn } from '@angular/forms';
import { phone_regex } from '../models/regex';

export function phoneValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        if (control.value.search(phone_regex) == 0) {
            return null;
        }
        return {'invalidPhone': {value: control.value}};

    };
  }