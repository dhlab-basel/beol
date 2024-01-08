import { Pipe, PipeTransform } from '@angular/core';

type BindingGraphDB = {
    datatype?: string,
    type: string,
    value: string
}

@Pipe({
  name: 'reisbuechleinURI'
})
export class ReisbuechleinUriPipe implements PipeTransform {

  transform(value: BindingGraphDB): string {
      return (value.type === "uri") ? value.value.split("#")[1] : value.value;
  }

}
