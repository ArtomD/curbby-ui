import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'phoneFormat',pure: true})
export class PhoneFormatPipe implements PipeTransform {
  transform(tel: string): string {
    if (!tel) { return ''; }

    var value = tel.toString().trim().replace(/^\+/, '');

    if (value.match(/[^0-9]/)) {
        return tel;
    }

    var country, city, number, prefix;
    if(value.length > 0){
      prefix = value[0];
      value = value.slice(1);
    }
    switch (value.length) {
        case 1:
        case 2:
        case 3:
            city = value;
            break;
        default:
            city = value.slice(0, 3);
            number = value.slice(3);
    }
    if(number){
        if(number.length>3){
            number = number.slice(0, 3) + '-' + number.slice(3,7);
        }
        else{
            number = number;
        }
        if(!prefix){
            return "+";
        }
        return ("+"+prefix+"(" + city + ") " + number).trim();
    }
    else{
        if(!prefix){
            return "+";
        }
        return "+"+prefix+ "(" + city;
    };
  }
}