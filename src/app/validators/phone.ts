import { AbstractControl, ValidatorFn } from '@angular/forms';
import { phone_regex } from '../models/regex';

export function phoneValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
        let temp = control.value.replace(/[^0-9]+/g, "");
        if (temp.search(phone_regex) == 0) {
            console.log("PASS");
            return null;            
        }
        console.log("FAIL");
        return {'invalidPhone': {value: temp}};

    };
  }